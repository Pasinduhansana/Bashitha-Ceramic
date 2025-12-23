import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { PERMISSIONS, PermissionError, requirePermission } from "@/lib/permissions";

// GET - Fetch audit logs
export async function GET(request) {
  try {
    // Only roles with VIEW_AUDIT_LOGS can access audit logs
    let user = null;
    try {
      user = await requirePermission(PERMISSIONS.VIEW_AUDIT_LOGS);
    } catch (err) {
      if (err instanceof PermissionError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const search = searchParams.get("search");
    const limit = searchParams.get("limit") || 100;

    const db = getDb();
    let query = `
      SELECT 
        a.*,
        u.name as user_name,
        u.img_url as user_img_url
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (action && action !== "all") {
      query += ` AND a.action LIKE ?`;
      params.push(`${action}%`);
    }

    if (search) {
      query += ` AND (u.name LIKE ? OR a.action LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY a.timestamp DESC LIMIT ?`;
    params.push(parseInt(limit));

    const [logs] = await db.execute(query, params);

    // Format logs for frontend
    const formattedLogs = logs.map((log) => ({
      ...log,
      details: `${log.action.replace(/_/g, " ")} on ${log.table_name} (ID: ${log.record_id})`,
    }));

    return NextResponse.json({ logs: formattedLogs });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
