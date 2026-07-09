import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

// GET - Fetch single invoice with items
export async function GET(request, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = token ? verifyToken(token) : null;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();

    // Fetch invoice
    const invoiceResult = await db.execute({
      sql: `
        SELECT 
          i.*,
          c.name AS customer_name,
          c.contact AS customer_contact,
          u.name AS user_name
        FROM invoices i
        LEFT JOIN customers c ON i.customer_id = c.id
        LEFT JOIN users u ON i.user_id = u.id
        WHERE i.id = ?
      `,
      args: [id],
    });


    if (invoiceResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }


    // Fetch invoice items
    const itemsResult = await db.execute({
      sql: `
        SELECT 
          ii.*,
          p.name AS product_name,
          p.code AS product_code
        FROM invoice_items ii
        LEFT JOIN products p ON ii.product_id = p.id
        WHERE ii.invoice_id = ?
      `,
      args: [id],
    });


    return NextResponse.json({
      invoice: invoiceResult.rows[0],
      items: itemsResult.rows,
    });


  } catch (error) {
    console.error("Error fetching invoice:", error);

    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}


// DELETE - Delete invoice
export async function DELETE(request, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = token ? verifyToken(token) : null;

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }


    const { id } = await params;
    const db = getDb();


    // Get invoice items
    const itemsResult = await db.execute({
      sql: `
        SELECT product_id, qty
        FROM invoice_items
        WHERE invoice_id = ?
      `,
      args: [id],
    });


    const items = itemsResult.rows;


    // Restore stock
    for (const item of items) {

      await db.execute({
        sql: `
          UPDATE products
          SET qty = qty + ?
          WHERE id = ?
        `,
        args: [
          item.qty,
          item.product_id
        ],
      });


      // Stock restoration log
      await db.execute({
        sql: `
          INSERT INTO stock_logs
          (
            product_id,
            action,
            qty,
            invoice_id,
            user_id,
            created_at
          )
          VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `,
        args: [
          item.product_id,
          "INVOICE_DELETE",
          item.qty,
          id,
          user.id
        ],
      });

    }


    // Delete invoice items
    await db.execute({
      sql: `
        DELETE FROM invoice_items
        WHERE invoice_id = ?
      `,
      args: [id],
    });


    // Delete invoice
    await db.execute({
      sql: `
        DELETE FROM invoices
        WHERE id = ?
      `,
      args: [id],
    });



    // Audit log
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
        "DELETE_INVOICE",
        "invoices",
        id
      ],
    });


    return NextResponse.json({
      success: true
    });


  } catch (error) {
    console.error("Error deleting invoice:", error);

    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}



// PATCH - Update invoice status
export async function PATCH(request, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = token ? verifyToken(token) : null;

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }


    const { id } = await params;
    const body = await request.json();

    const { status } = body;


    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }


    const db = getDb();


    await db.execute({
      sql: `
        UPDATE invoices
        SET status = ?
        WHERE id = ?
      `,
      args: [
        status,
        id
      ],
    });



    // Audit log
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
        "UPDATE_INVOICE",
        "invoices",
        id
      ],
    });



    return NextResponse.json({
      success: true
    });


  } catch (error) {
    console.error("Error updating invoice:", error);

    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}