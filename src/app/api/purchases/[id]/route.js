import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { PERMISSIONS, PermissionError, requirePermission } from "@/lib/permissions";

// GET - Fetch single purchase with items
export async function GET(request, { params }) {
  try {
    // Viewing a purchase requires MANAGE_PURCHASES
    let user = null;
    try {
      user = await requirePermission(PERMISSIONS.MANAGE_PURCHASES);
    } catch (err) {
      if (err instanceof PermissionError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }

    const { id } = await params;
    const db = getDb();

    // Fetch purchase
    const [purchases] = await db.execute(
      `SELECT 
        p.*,
        s.name as supplier_name,
        s.contact as supplier_contact,
        u.name as user_name
      FROM purchases p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?`,
      [id]
    );

    if (purchases.length === 0) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    }

    // Fetch purchase items
    const [items] = await db.execute(
      `SELECT 
        pi.*,
        p.name as product_name,
        p.code as product_code
      FROM purchase_items pi
      LEFT JOIN products p ON pi.product_id = p.id
      WHERE pi.purchase_id = ?`,
      [id]
    );

    return NextResponse.json({ purchase: purchases[0], items });
  } catch (error) {
    console.error("Error fetching purchase:", error);
    return NextResponse.json({ error: "Failed to fetch purchase" }, { status: 500 });
  }
}

// DELETE - Delete purchase
export async function DELETE(request, { params }) {
  try {
    // Deleting / effectively approving a purchase requires APPROVE_PURCHASES
    let user = null;
    try {
      user = await requirePermission(PERMISSIONS.APPROVE_PURCHASES);
    } catch (err) {
      if (err instanceof PermissionError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }

    const { id } = await params;
    const db = getDb();

    // Get purchase items to restore stock
    const [items] = await db.execute(`SELECT product_id, qty FROM purchase_items WHERE purchase_id = ?`, [id]);

    // Restore stock for each item
    for (const item of items) {
      await db.execute(`UPDATE products SET qty = qty - ? WHERE id = ?`, [item.qty, item.product_id]);

      // Log stock change
      await db.execute(
        `INSERT INTO stock_logs (product_id, action, qty, purchase_id, user_id, created_at) VALUES (?, 'PURCHASE_DELETE', ?, ?, ?, NOW())`,
        [item.product_id, -item.qty, id, user.id]
      );
    }

    // Delete purchase items
    await db.execute(`DELETE FROM purchase_items WHERE purchase_id = ?`, [id]);

    // Delete purchase
    await db.execute(`DELETE FROM purchases WHERE id = ?`, [id]);

    // Log audit
    await db.execute(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, timestamp) VALUES (?, 'DELETE_PURCHASE', 'purchases', ?, NOW())`,
      [user.id, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting purchase:", error);
    return NextResponse.json({ error: "Failed to delete purchase" }, { status: 500 });
  }
}
