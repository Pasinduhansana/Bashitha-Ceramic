import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { PERMISSIONS, PermissionError, requirePermission } from "@/lib/permissions";


// GET - Fetch single product with stock history
export async function GET(request, { params }) {
  try {

    try {
      await requirePermission(PERMISSIONS.VIEW_STOCK_LOGS);
    } catch (err) {
      if (err instanceof PermissionError) {
        return NextResponse.json(
          { error: err.message },
          { status: err.status }
        );
      }
      throw err;
    }


    const { id } = await params;
    const db = getDb();


    const productResult = await db.execute({
      sql: `
        SELECT 
          p.*,
          c.name AS category_name
        FROM products p
        LEFT JOIN categories c 
          ON p.category_id = c.id
        WHERE p.id = ?
      `,
      args: [id],
    });


    if (productResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }


    const stockResult = await db.execute({
      sql: `
        SELECT 
          sl.*,
          u.name AS user_name,
          i.invoice_no,
          p.id AS purchase_no
        FROM stock_logs sl
        LEFT JOIN users u 
          ON sl.user_id = u.id
        LEFT JOIN invoices i 
          ON sl.invoice_id = i.id
        LEFT JOIN purchases p 
          ON sl.purchase_id = p.id
        WHERE sl.product_id = ?
        ORDER BY sl.created_at DESC
        LIMIT 50
      `,
      args: [id],
    });


    return NextResponse.json({
      product: productResult.rows[0],
      stockHistory: stockResult.rows,
    });


  } catch (error) {

    console.error("Error fetching product:", error);

    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}



// PUT - Update product
export async function PUT(request, { params }) {
  try {

    let user = null;

    try {
      user = await requirePermission(PERMISSIONS.EDIT_PRODUCTS);
    } catch (err) {
      if (err instanceof PermissionError) {
        return NextResponse.json(
          { error: err.message },
          { status: err.status }
        );
      }
      throw err;
    }


    const { id } = await params;
    const body = await request.json();

    const db = getDb();


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


    const updateFields = [];
    const updateValues = [];


    allowedFields.forEach((field) => {

      if (body[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(body[field]);
      }

    });


    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }


    updateValues.push(id);


    await db.execute({
      sql: `
        UPDATE products
        SET 
          ${updateFields.join(", ")},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: updateValues,
    });



    if (user) {

      await db.execute({
        sql: `
          INSERT INTO audit_logs
          (
            user_id,
            action,
            table_name,
            record_id,
            timestamp
          )
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `,
        args: [
          user.id,
          "UPDATE_PRODUCT",
          "products",
          id
        ],
      });

    }


    return NextResponse.json({
      success: true
    });


  } catch (error) {

    console.error("Error updating product:", error);

    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}



// DELETE - Delete product
export async function DELETE(request, { params }) {
  try {

    let user = null;

    try {
      user = await requirePermission(PERMISSIONS.DELETE_PRODUCTS);
    } catch (err) {
      if (err instanceof PermissionError) {
        return NextResponse.json(
          { error: err.message },
          { status: err.status }
        );
      }
      throw err;
    }


    const { id } = await params;
    const db = getDb();



    const invoiceCheck = await db.execute({
      sql: `
        SELECT COUNT(*) AS count
        FROM invoice_items
        WHERE product_id = ?
      `,
      args: [id],
    });



    const purchaseCheck = await db.execute({
      sql: `
        SELECT COUNT(*) AS count
        FROM purchase_items
        WHERE product_id = ?
      `,
      args: [id],
    });



    if (
      Number(invoiceCheck.rows[0].count) > 0 ||
      Number(purchaseCheck.rows[0].count) > 0
    ) {

      return NextResponse.json(
        {
          error: "Cannot delete product with existing transactions"
        },
        {
          status: 400
        }
      );

    }



    const productResult = await db.execute({
      sql: `
        SELECT 
          p.*,
          c.name AS category_name
        FROM products p
        LEFT JOIN categories c 
          ON p.category_id = c.id
        WHERE p.id = ?
      `,
      args: [id],
    });


    const productData = productResult.rows[0]
      ? JSON.stringify(productResult.rows[0])
      : null;



    await db.execute({
      sql: `
        DELETE FROM stock_logs
        WHERE product_id = ?
      `,
      args: [id],
    });



    await db.execute({
      sql: `
        DELETE FROM products
        WHERE id = ?
      `,
      args: [id],
    });



    if (user) {

      await db.execute({
        sql: `
          INSERT INTO audit_logs
          (
            user_id,
            action,
            table_name,
            record_id,
            old_data,
            timestamp
          )
          VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `,
        args: [
          user.id,
          "DELETE_PRODUCT",
          "products",
          id,
          productData
        ],
      });

    }



    return NextResponse.json({
      success: true
    });



  } catch (error) {

    console.error("Error deleting product:", error);

    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}



// PATCH - Update inventory quantity
export async function PATCH(request, { params }) {
  try {

    let user = null;

    try {
      user = await requirePermission(PERMISSIONS.UPDATE_STOCK);
    } catch (err) {
      if (err instanceof PermissionError) {
        return NextResponse.json(
          { error: err.message },
          { status: err.status }
        );
      }
      throw err;
    }


    const { id } = await params;

    const body = await request.json();

    const {
      action,
      qty,
      reason
    } = body;


    if (!action || !qty || qty <= 0) {
      return NextResponse.json(
        { error: "Invalid data" },
        { status: 400 }
      );
    }


    const db = getDb();



    const productResult = await db.execute({
      sql: `
        SELECT qty
        FROM products
        WHERE id = ?
      `,
      args: [id],
    });



    if (productResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }



    const currentQty = Number(productResult.rows[0].qty);

    let newQty;
    let stockAction;
    let logQty;



    if (action === "add") {

      newQty = currentQty + qty;
      stockAction = reason || "MANUAL_ADD";
      logQty = qty;


    } else if (action === "remove") {


      if (currentQty < qty) {
        return NextResponse.json(
          { error: "Insufficient stock" },
          { status: 400 }
        );
      }


      newQty = currentQty - qty;
      stockAction = reason || "MANUAL_REMOVE";
      logQty = -qty;


    } else {

      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );

    }




    await db.execute({
      sql: `
        UPDATE products
        SET 
          qty = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [
        newQty,
        id
      ],
    });




    await db.execute({
      sql: `
        INSERT INTO stock_logs
        (
          product_id,
          action,
          qty,
          user_id,
          created_at
        )
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `,
      args: [
        id,
        stockAction,
        logQty,
        user?.id || null
      ],
    });




    if (user) {

      await db.execute({
        sql: `
          INSERT INTO audit_logs
          (
            user_id,
            action,
            table_name,
            record_id,
            timestamp
          )
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `,
        args: [
          user.id,
          "UPDATE_INVENTORY",
          "products",
          id
        ],
      });

    }



    return NextResponse.json({
      success: true,
      newQty
    });



  } catch (error) {

    console.error("Error updating inventory:", error);

    return NextResponse.json(
      { error: "Failed to update inventory" },
      { status: 500 }
    );
  }
}