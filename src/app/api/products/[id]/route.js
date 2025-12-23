import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { PERMISSIONS, PermissionError, requirePermission } from "@/lib/permissions";

// GET - Fetch single product with stock history
export async function GET(request, { params }) {
  try {
    // Viewing product details / stock history requires VIEW_STOCK_LOGS
    try {
      await requirePermission(PERMISSIONS.VIEW_STOCK_LOGS);
    } catch (err) {
      if (err instanceof PermissionError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }

    const { id } = await params;
    const db = getDb();

    // Get product details
    const [products] = await db.execute(
      `SELECT 
        p.*,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?`,
      [id]
    );

    if (products.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Get stock history
    const [stockHistory] = await db.execute(
      `SELECT 
        sl.*,
        u.name as user_name,
        i.invoice_no,
        p.id as purchase_no
      FROM stock_logs sl
      LEFT JOIN users u ON sl.user_id = u.id
      LEFT JOIN invoices i ON sl.invoice_id = i.id
      LEFT JOIN purchases p ON sl.purchase_id = p.id
      WHERE sl.product_id = ?
      ORDER BY sl.created_at DESC
      LIMIT 50`,
      [id]
    );

    return NextResponse.json({
      product: products[0],
      stockHistory,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

// PUT - Update product
export async function PUT(request, { params }) {
  try {
    // Editing product details requires EDIT_PRODUCTS
    let user = null;
    try {
      user = await requirePermission(PERMISSIONS.EDIT_PRODUCTS);
    } catch (err) {
      if (err instanceof PermissionError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }

    const { id } = await params;
    const body = await request.json();
    const db = getDb();

    // Build update query dynamically based on provided fields
    const updateFields = [];
    const updateValues = [];

    const allowedFields = [
      "product_type",
      "name",
      "brand",
      "code",
      "new_code",
      "shade",
      "new_shade",
      "size",
      "photo_url",
      "unit",
      "cost_price",
      "selling_price",
      "reorder_level",
      "category_id",
      "description",
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(body[field]);
      }
    });

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    updateValues.push(id);

    await db.execute(`UPDATE products SET ${updateFields.join(", ")}, updated_at = NOW() WHERE id = ?`, updateValues);

    // Log audit
    if (user) {
      await db.execute(
        `INSERT INTO audit_logs (user_id, action, table_name, record_id, timestamp) VALUES (?, 'UPDATE_PRODUCT', 'products', ?, NOW())`,
        [user.id, id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE - Delete product
export async function DELETE(request, { params }) {
  try {
    // Deleting products requires DELETE_PRODUCTS
    let user = null;
    try {
      user = await requirePermission(PERMISSIONS.DELETE_PRODUCTS);
    } catch (err) {
      if (err instanceof PermissionError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }

    const { id } = await params;
    const db = getDb();

    // Check if product is used in any transactions
    const [invoiceItems] = await db.execute(`SELECT COUNT(*) as count FROM invoice_items WHERE product_id = ?`, [id]);

    const [purchaseItems] = await db.execute(`SELECT COUNT(*) as count FROM purchase_items WHERE product_id = ?`, [id]);

    if (invoiceItems[0].count > 0 || purchaseItems[0].count > 0) {
      return NextResponse.json({ error: "Cannot delete product with existing transactions" }, { status: 400 });
    }

    // Delete stock logs
    await db.execute(`DELETE FROM stock_logs WHERE product_id = ?`, [id]);

    // Delete product
    await db.execute(`DELETE FROM products WHERE id = ?`, [id]);

    // Log audit
    if (user) {
      await db.execute(
        `INSERT INTO audit_logs (user_id, action, table_name, record_id, timestamp) VALUES (?, 'DELETE_PRODUCT', 'products', ?, NOW())`,
        [user.id, id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}

// PATCH - Update inventory quantity
export async function PATCH(request, { params }) {
  try {
    // Manual inventory adjustments require UPDATE_STOCK
    let user = null;
    try {
      user = await requirePermission(PERMISSIONS.UPDATE_STOCK);
    } catch (err) {
      if (err instanceof PermissionError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }

    const { id } = await params;
    const body = await request.json();
    const { action, qty, reason } = body; // action: 'add' or 'remove'

    if (!action || !qty || qty <= 0) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const db = getDb();

    // Get current stock
    const [products] = await db.execute(`SELECT qty FROM products WHERE id = ?`, [id]);

    if (products.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const currentQty = products[0].qty;
    let newQty;
    let stockAction;
    let logQty;

    if (action === "add") {
      newQty = currentQty + qty;
      stockAction = reason || "MANUAL_ADD";
      logQty = qty;
    } else if (action === "remove") {
      if (currentQty < qty) {
        return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
      }
      newQty = currentQty - qty;
      stockAction = reason || "MANUAL_REMOVE";
      logQty = -qty;
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Update product quantity
    await db.execute(`UPDATE products SET qty = ?, updated_at = NOW() WHERE id = ?`, [newQty, id]);

    // Log stock change
    await db.execute(`INSERT INTO stock_logs (product_id, action, qty, user_id, created_at) VALUES (?, ?, ?, ?, NOW())`, [
      id,
      stockAction,
      logQty,
      user?.id || null,
    ]);

    // Log audit
    if (user) {
      await db.execute(
        `INSERT INTO audit_logs (user_id, action, table_name, record_id, timestamp) VALUES (?, 'UPDATE_INVENTORY', 'products', ?, NOW())`,
        [user.id, id]
      );
    }

    return NextResponse.json({ success: true, newQty });
  } catch (error) {
    console.error("Error updating inventory:", error);
    return NextResponse.json({ error: "Failed to update inventory" }, { status: 500 });
  }
}
