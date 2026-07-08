import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

// GET - Fetch single customer with purchase history
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

    // Fetch customer
    const { rows: customers } = await db.query(
      `SELECT 
        c.*,
        COUNT(DISTINCT i.id) as invoice_count,
        COALESCE(SUM(i.net_amount), 0) as total_purchases
      FROM customers c
      LEFT JOIN invoices i ON c.id = i.customer_id
      WHERE c.id = $1
      GROUP BY c.id`,
      [id],
    );

    if (customers.length === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Fetch recent invoices
    const { rows: invoices } = await db.query(`SELECT * FROM invoices WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 10`, [id]);

    return NextResponse.json({ customer: customers[0], invoices });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 });
  }
}

// PUT - Update customer
export async function PUT(request, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = token ? verifyToken(token) : null;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, contact, remark } = body;

    if (!name || !contact) {
      return NextResponse.json({ error: "Name and contact are required" }, { status: 400 });
    }

    const db = getDb();

    await db.query(`UPDATE customers SET name = $1, contact = $2, remark = $3 WHERE id = $4`, [name, contact, remark || null, id]);

    // Log audit
    await db.query(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, timestamp) VALUES ($1, 'UPDATE_CUSTOMER', 'customers', $2, CURRENT_TIMESTAMP)`,
      [user.id, id],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}

// DELETE - Delete customer
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

    // Check if customer has invoices
    const { rows } = await db.query(`SELECT COUNT(*) as count FROM invoices WHERE customer_id = $1`, [id]);

    if (rows[0].count > 0) {
      return NextResponse.json({ error: "Cannot delete customer with existing invoices" }, { status: 400 });
    }

    await db.query(`DELETE FROM customers WHERE id = $1`, [id]);

    // Log audit
    await db.query(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, timestamp) VALUES ($1, 'DELETE_CUSTOMER', 'customers', $2, CURRENT_TIMESTAMP)`,
      [user.id, id],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}
