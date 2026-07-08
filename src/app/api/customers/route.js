import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

// GET - Fetch all customers with their stats
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = token ? verifyToken(token) : null;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const db = getDb();
    let query = `
      SELECT 
        c.*,
        COUNT(DISTINCT i.id) as invoice_count,
        COALESCE(SUM(i.net_amount), 0) as total_purchases
      FROM customers c
      LEFT JOIN invoices i ON c.id = i.customer_id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      const paramIndex = params.length + 1;
      query += ` AND (c.name LIKE $${paramIndex} OR c.contact LIKE $${paramIndex + 1})`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` GROUP BY c.id ORDER BY c.created_at DESC`;

    const { rows: customers } = await db.query(query, params);

    return NextResponse.json({ customers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

// POST - Create new customer
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = token ? verifyToken(token) : null;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, contact, remark } = body;

    if (!name || !contact) {
      return NextResponse.json({ error: "Name and contact are required" }, { status: 400 });
    }

    const db = getDb();

    // Insert customer
    const { rows } = await db.query(`INSERT INTO customers (name, contact, remark, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING id`, [
      name,
      contact,
      remark || null,
    ]);

    const customer_id = rows[0].id;

    // Log audit
    await db.query(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, timestamp) VALUES ($1, 'CREATE_CUSTOMER', 'customers', $2, CURRENT_TIMESTAMP)`,
      [user.id, customer_id],
    );

    return NextResponse.json({ success: true, customer_id });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}
