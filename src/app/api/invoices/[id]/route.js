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
    const [invoices] = await db.execute(
      `SELECT 
        i.*,
        c.name as customer_name,
        c.contact as customer_contact,
        u.name as user_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN users u ON i.user_id = u.id
      WHERE i.id = ?`,
      [id],
    );

    if (invoices.length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Fetch invoice items
    const [items] = await db.execute(
      `SELECT 
        ii.*,
        p.name as product_name,
        p.code as product_code
      FROM invoice_items ii
      LEFT JOIN products p ON ii.product_id = p.id
      WHERE ii.invoice_id = ?`,
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
    const [items] = await db.execute(`SELECT product_id, qty FROM invoice_items WHERE invoice_id = ?`, [id]);

    // Restore stock for each item
    for (const item of items) {
      await db.execute(`UPDATE products SET qty = qty + ? WHERE id = ?`, [item.qty, item.product_id]);

      // Log stock restoration
      await db.execute(
        `INSERT INTO stock_logs (product_id, action, qty, invoice_id, user_id, created_at) VALUES (?, 'INVOICE_DELETE', ?, ?, ?, NOW())`,
        [item.product_id, item.qty, id, user.id],
      );
    }

    // Delete invoice items
    await db.execute(`DELETE FROM invoice_items WHERE invoice_id = ?`, [id]);

    // Delete invoice
    await db.execute(`DELETE FROM invoices WHERE id = ?`, [id]);

    // Log audit
    await db.execute(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, timestamp) VALUES (?, 'DELETE_INVOICE', 'invoices', ?, NOW())`,
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
    await db.execute(`UPDATE invoices SET status = ? WHERE id = ?`, [status, id]);

    // Log audit
    await db.execute(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, timestamp) VALUES (?, 'UPDATE_INVOICE', 'invoices', ?, NOW())`,
      [user.id, id],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}
