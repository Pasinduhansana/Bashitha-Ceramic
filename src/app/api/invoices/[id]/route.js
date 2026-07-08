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
    const { rows: invoices } = await db.query(
      `SELECT 
        i.*,
        c.name as customer_name,
        c.contact as customer_contact,
        u.name as user_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN users u ON i.user_id = u.id
      WHERE i.id = $1`,
      [id],
    );

    if (invoices.length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Fetch invoice items
    const { rows: items } = await db.query(
      `SELECT 
        ii.*,
        p.name as product_name,
        p.code as product_code
      FROM invoice_items ii
      LEFT JOIN products p ON ii.product_id = p.id
      WHERE ii.invoice_id = $1`,
      [id],
    );

    return NextResponse.json({ invoice: invoices[0], items });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 });
  }
}

// DELETE - Delete invoice
export async function DELETE(request, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = token ? verifyToken(token) : null;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();

    // Get invoice items to restore stock
    const { rows: items } = await db.query(`SELECT product_id, qty FROM invoice_items WHERE invoice_id = $1`, [id]);

    // Restore stock for each item
    for (const item of items) {
      await db.query(`UPDATE products SET qty = qty + $1 WHERE id = $2`, [item.qty, item.product_id]);

      // Log stock restoration
      await db.query(
        `INSERT INTO stock_logs (product_id, action, qty, invoice_id, user_id, created_at) VALUES ($1, 'INVOICE_DELETE', $2, $3, $4, CURRENT_TIMESTAMP)`,
        [item.product_id, item.qty, id, user.id],
      );
    }

    // Delete invoice items
    await db.query(`DELETE FROM invoice_items WHERE invoice_id = $1`, [id]);

    // Delete invoice
    await db.query(`DELETE FROM invoices WHERE id = $1`, [id]);

    // Log audit
    await db.query(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, timestamp) VALUES ($1, 'DELETE_INVOICE', 'invoices', $2, CURRENT_TIMESTAMP)`,
      [user.id, id],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
  }
}

// PATCH - Update invoice status
export async function PATCH(request, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = token ? verifyToken(token) : null;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const db = getDb();
    await db.query(`UPDATE invoices SET status = $1 WHERE id = $2`, [status, id]);

    // Log audit
    await db.query(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, timestamp) VALUES ($1, 'UPDATE_INVOICE', 'invoices', $2, CURRENT_TIMESTAMP)`,
      [user.id, id],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}
