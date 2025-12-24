import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { PERMISSIONS, PermissionError, requirePermission } from "@/lib/permissions";

// GET - Fetch all invoices with customer info
export async function GET(request) {
  try {
    // Viewing invoices is part of CREATE_INVOICES permission set
    let user = null;
    try {
      user = await requirePermission(PERMISSIONS.CREATE_INVOICES);
    } catch (err) {
      if (err instanceof PermissionError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const db = getDb();
    let query = `
      SELECT 
        i.*,
        c.name as customer_name,
        c.contact as customer_contact,
        u.name as user_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN users u ON i.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== "all") {
      query += ` AND i.status = ?`;
      params.push(status);
    }

    if (search) {
      query += ` AND (i.invoice_no LIKE ? OR c.name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY i.created_at DESC`;

    const [invoices] = await db.execute(query, params);

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

// POST - Create new invoice
export async function POST(request) {
  try {
    // Creating invoices requires CREATE_INVOICES
    let user = null;
    try {
      user = await requirePermission(PERMISSIONS.CREATE_INVOICES);
    } catch (err) {
      if (err instanceof PermissionError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }

    const body = await request.json();
    const { customer, items, discount, payment_method } = body;

    if (!customer || !customer.contact || !customer.name || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = getDb();

    let customer_id;

    // Check if using existing customer or creating new one
    if (customer.existing_id) {
      customer_id = customer.existing_id;
    } else {
      // Create new customer
      const [customerResult] = await db.execute(`INSERT INTO customers (name, contact, remark, created_at) VALUES (?, ?, ?, NOW())`, [
        customer.name,
        customer.contact,
        customer.remark || null,
      ]);
      customer_id = customerResult.insertId;

      // Log customer creation
      await db.execute(
        `INSERT INTO audit_logs (user_id, action, table_name, record_id, timestamp) VALUES (?, 'CREATE_CUSTOMER', 'customers', ?, NOW())`,
        [user.id, customer_id]
      );
    }

    // Calculate totals
    let total_amount = 0;
    for (const item of items) {
      total_amount += item.qty * item.selling_price;
    }
    const net_amount = total_amount - (discount || 0);

    // Generate invoice number
    const [[{ max_id }]] = await db.execute("SELECT MAX(id) as max_id FROM invoices");
    const invoice_no = `INV-${new Date().getFullYear()}-${String((max_id || 0) + 1).padStart(3, "0")}`;

    // Insert invoice
    const [result] = await db.execute(
      `INSERT INTO invoices (invoice_no, customer_id, user_id, total_amount, discount, net_amount, payment_method, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [invoice_no, customer_id, user.id, total_amount, discount || 0, net_amount, payment_method]
    );

    const invoice_id = result.insertId;

    // Insert invoice items and update stock
    for (const item of items) {
      // Insert invoice item
      const line_total = item.qty * item.selling_price;
      await db.execute(`INSERT INTO invoice_items (invoice_id, product_id, qty, selling_price, line_total) VALUES (?, ?, ?, ?, ?)`, [
        invoice_id,
        item.product_id,
        item.qty,
        item.selling_price,
        line_total,
      ]);

      // Update product stock
      await db.execute(`UPDATE products SET qty = qty - ? WHERE id = ?`, [item.qty, item.product_id]);

      // Log stock change
      await db.execute(`INSERT INTO stock_logs (product_id, action, qty, invoice_id, user_id, created_at) VALUES (?, 'SALE', ?, ?, ?, NOW())`, [
        item.product_id,
        -item.qty,
        invoice_id,
        user.id,
      ]);
    }

    // Log audit
    await db.execute(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, timestamp) VALUES (?, 'CREATE_INVOICE', 'invoices', ?, NOW())`,
      [user.id, invoice_id]
    );

    return NextResponse.json({ success: true, invoice_id, invoice_no });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
