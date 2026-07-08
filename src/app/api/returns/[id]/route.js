import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { PERMISSIONS, PermissionError, requirePermission } from "@/lib/permissions";

// GET - Fetch single return
export async function GET(request, { params }) {
  try {
    // Viewing a single return requires MANAGE_RETURNS
    let user = null;
    try {
      user = await requirePermission(PERMISSIONS.MANAGE_RETURNS);
    } catch (err) {
      if (err instanceof PermissionError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }

    const { id } = await params;
    const db = getDb();

    const { rows: returns } = await db.query(
      `SELECT 
        r.*,
        p.name as product_name,
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
      WHERE r.id = $1`,
      [id],
    );

    if (returns.length === 0) {
      return NextResponse.json({ error: "Return not found" }, { status: 404 });
    }

    return NextResponse.json({ return: returns[0] });
  } catch (error) {
    console.error("Error fetching return:", error);
    return NextResponse.json({ error: "Failed to fetch return" }, { status: 500 });
  }
}

// PATCH - Approve or reject return
export async function PATCH(request, { params }) {
  try {
    // Approving / rejecting returns requires APPROVE_RETURNS
    let user = null;
    try {
      user = await requirePermission(PERMISSIONS.APPROVE_RETURNS);
    } catch (err) {
      if (err instanceof PermissionError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const db = getDb();

    // Get return details
    const { rows: returns } = await db.query(`SELECT * FROM returns WHERE id = $1`, [id]);

    if (returns.length === 0) {
      return NextResponse.json({ error: "Return not found" }, { status: 404 });
    }

    const returnData = returns[0];

    // Update return status
    await db.query(`UPDATE returns SET status = $1 WHERE id = $2`, [status, id]);

    // If approved, update stock
    if (status === "approved") {
      if (returnData.invoice_id) {
        // Invoice return - add stock back
        await db.query(`UPDATE products SET qty = qty + $1 WHERE id = $2`, [returnData.qty, returnData.product_id]);

        // Log stock change
        await db.query(
          `INSERT INTO stock_logs (product_id, action, qty, return_id, user_id, created_at) 
           VALUES ($1, 'RETURN_INVOICE', $2, $3, $4, CURRENT_TIMESTAMP)`,
          [returnData.product_id, returnData.qty, id, user.id],
        );
      } else if (returnData.purchase_id) {
        // Purchase return - reduce stock
        await db.query(`UPDATE products SET qty = qty - $1 WHERE id = $2`, [returnData.qty, returnData.product_id]);

        // Log stock change
        await db.query(
          `INSERT INTO stock_logs (product_id, action, qty, return_id, user_id, created_at) 
           VALUES ($1, 'RETURN_PURCHASE', $2, $3, $4, CURRENT_TIMESTAMP)`,
          [returnData.product_id, -returnData.qty, id, user.id],
        );
      }
    }

    // Log audit
    await db.query(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, timestamp) VALUES ($1, 'APPROVE_RETURN', 'returns', $2, CURRENT_TIMESTAMP)`,
      [user.id, id],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating return:", error);
    return NextResponse.json({ error: "Failed to update return" }, { status: 500 });
  }
}

// DELETE - Delete return
export async function DELETE(request, { params }) {
  try {
    // Deleting returns still considered MANAGE_RETURNS
    let user = null;
    try {
      user = await requirePermission(PERMISSIONS.MANAGE_RETURNS);
    } catch (err) {
      if (err instanceof PermissionError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }

    const { id } = await params;
    const db = getDb();

    await db.query(`DELETE FROM returns WHERE id = $1`, [id]);

    // Log audit
    await db.query(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, timestamp) VALUES ($1, 'DELETE_RETURN', 'returns', $2, CURRENT_TIMESTAMP)`,
      [user.id, id],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting return:", error);
    return NextResponse.json({ error: "Failed to delete return" }, { status: 500 });
  }
}
