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

    const [returns] = await db.execute(
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
      WHERE r.id = ?`,
      [id]
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
    const [returns] = await db.execute(`SELECT * FROM returns WHERE id = ?`, [id]);

    if (returns.length === 0) {
      return NextResponse.json({ error: "Return not found" }, { status: 404 });
    }

    const returnData = returns[0];

    // Update return status
    await db.execute(`UPDATE returns SET status = ? WHERE id = ?`, [status, id]);

    // If approved, update stock
    if (status === "approved") {
      if (returnData.invoice_id) {
        // Invoice return - add stock back
        await db.execute(`UPDATE products SET qty = qty + ? WHERE id = ?`, [returnData.qty, returnData.product_id]);

        // Log stock change
        await db.execute(
          `INSERT INTO stock_logs (product_id, action, qty, return_id, user_id, created_at) 
           VALUES (?, 'RETURN_INVOICE', ?, ?, ?, NOW())`,
          [returnData.product_id, returnData.qty, id, user.id]
        );
      } else if (returnData.purchase_id) {
        // Purchase return - reduce stock
        await db.execute(`UPDATE products SET qty = qty - ? WHERE id = ?`, [returnData.qty, returnData.product_id]);

        // Log stock change
        await db.execute(
          `INSERT INTO stock_logs (product_id, action, qty, return_id, user_id, created_at) 
           VALUES (?, 'RETURN_PURCHASE', ?, ?, ?, NOW())`,
          [returnData.product_id, -returnData.qty, id, user.id]
        );
      }
    }

    // Log audit
    await db.execute(`INSERT INTO audit_logs (user_id, action, table_name, record_id, timestamp) VALUES (?, 'APPROVE_RETURN', 'returns', ?, NOW())`, [
      user.id,
      id,
    ]);

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

    await db.execute(`DELETE FROM returns WHERE id = ?`, [id]);

    // Log audit
    await db.execute(`INSERT INTO audit_logs (user_id, action, table_name, record_id, timestamp) VALUES (?, 'DELETE_RETURN', 'returns', ?, NOW())`, [
      user.id,
      id,
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting return:", error);
    return NextResponse.json({ error: "Failed to delete return" }, { status: 500 });
  }
}
