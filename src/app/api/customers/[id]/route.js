import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

// GET - Fetch single customer with purchase history
export async function GET(request, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const user = token ? verifyToken(token) : null;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();

    // Fetch customer
    const [customers] = await db.execute(
      `SELECT 
        c.*,
        COUNT(DISTINCT i.id) as invoice_count,
        COALESCE(SUM(i.net_amount), 0) as total_purchases
      FROM customers c
      LEFT JOIN invoices i ON c.id = i.customer_id
      WHERE c.id = ?
      GROUP BY c.id`,
      [id]
    );

    if (customers.length === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Fetch recent invoices
    const [invoices] = await db.execute(`SELECT * FROM invoices WHERE customer_id = ? ORDER BY created_at DESC LIMIT 10`, [id]);

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
    const token = cookieStore.get("token")?.value;
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

    await db.execute(`UPDATE customers SET name = ?, contact = ?, remark = ? WHERE id = ?`, [name, contact, remark || null, id]);

    // Log audit
    await db.execute(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, timestamp) VALUES (?, 'UPDATE_CUSTOMER', 'customers', ?, NOW())`,
      [user.id, id]
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
    const token = cookieStore.get("token")?.value;
    const user = token ? verifyToken(token) : null;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();

    // Check if customer has invoices
    const [[{ count }]] = await db.execute(`SELECT COUNT(*) as count FROM invoices WHERE customer_id = ?`, [id]);

    if (count > 0) {
      return NextResponse.json({ error: "Cannot delete customer with existing invoices" }, { status: 400 });
    }

    await db.execute(`DELETE FROM customers WHERE id = ?`, [id]);

    // Log audit
    await db.execute(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, timestamp) VALUES (?, 'DELETE_CUSTOMER', 'customers', ?, NOW())`,
      [user.id, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}
