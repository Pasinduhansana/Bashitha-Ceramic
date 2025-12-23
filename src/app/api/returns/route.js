import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { PERMISSIONS, PermissionError, requirePermission } from "@/lib/permissions";

// GET - Fetch all returns
export async function GET(request) {
  try {
    // Managing returns list requires MANAGE_RETURNS
    let user = null;
    try {
      user = await requirePermission(PERMISSIONS.MANAGE_RETURNS);
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
        r.*,
        p.name as product_name,
        p.code as product_code,
        i.invoice_no,
        pu.id as purchase_no,
        c.name as customer_name,
        s.name as supplier_name,
        u.name as user_name
      FROM returns r
      LEFT JOIN products p ON r.product_id = p.id
      LEFT JOIN invoices i ON r.invoice_id = i.id
      LEFT JOIN purchases pu ON r.purchase_id = pu.id
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN suppliers s ON pu.supplier_id = s.id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== "all") {
      query += ` AND r.status = ?`;
      params.push(status);
    }

    if (search) {
      query += ` AND (p.name LIKE ? OR i.invoice_no LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY r.created_at DESC`;

    const [returns] = await db.execute(query, params);

    // Add type field for frontend
    const returnsWithType = returns.map((ret) => ({
      ...ret,
      type: ret.invoice_id ? "invoice" : "purchase",
    }));

    return NextResponse.json({ returns: returnsWithType });
  } catch (error) {
    console.error("Error fetching returns:", error);
    return NextResponse.json({ error: "Failed to fetch returns" }, { status: 500 });
  }
}

// POST - Create new return
export async function POST(request) {
  try {
    // Creating returns requires MANAGE_RETURNS
    let user = null;
    try {
      user = await requirePermission(PERMISSIONS.MANAGE_RETURNS);
    } catch (err) {
      if (err instanceof PermissionError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }

    const body = await request.json();
    const { invoice_id, purchase_id, product_id, qty, reason } = body;

    if (!product_id || !qty || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!invoice_id && !purchase_id) {
      return NextResponse.json({ error: "Either invoice_id or purchase_id is required" }, { status: 400 });
    }

    const db = getDb();

    // Insert return
    const [result] = await db.execute(
      `INSERT INTO returns (invoice_id, purchase_id, product_id, qty, reason, status, user_id, created_at) 
       VALUES (?, ?, ?, ?, ?, 'pending', ?, NOW())`,
      [invoice_id || null, purchase_id || null, product_id, qty, reason, user.id]
    );

    const return_id = result.insertId;

    // Log audit
    await db.execute(`INSERT INTO audit_logs (user_id, action, table_name, record_id, timestamp) VALUES (?, 'CREATE_RETURN', 'returns', ?, NOW())`, [
      user.id,
      return_id,
    ]);

    return NextResponse.json({ success: true, return_id });
  } catch (error) {
    console.error("Error creating return:", error);
    return NextResponse.json({ error: "Failed to create return" }, { status: 500 });
  }
}
