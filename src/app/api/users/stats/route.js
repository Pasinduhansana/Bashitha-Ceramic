import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { PERMISSIONS, PermissionError, requirePermission } from "@/lib/permissions";

export async function GET() {
  try {
    try {
      await requirePermission(PERMISSIONS.MANAGE_USERS);
    } catch (err) {
      if (err instanceof PermissionError) {
        return NextResponse.json({ success: false, message: err.message }, { status: err.status });
      }
      throw err;
    }

    const db = getDb();
    const [stats] = await db.execute(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_users,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as new_today,
        SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH) THEN 1 ELSE 0 END) as new_this_month,
        SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 2 MONTH) AND DATE(created_at) < DATE_SUB(CURDATE(), INTERVAL 1 MONTH) THEN 1 ELSE 0 END) as new_last_month
      FROM users
    `);

    const result = stats[0];
    const growth = result.new_last_month > 0 ? (((result.new_this_month - result.new_last_month) / result.new_last_month) * 100).toFixed(1) : 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: result.total_users,
        activeUsers: result.active_users,
        inactiveUsers: result.inactive_users,
        newToday: result.new_today,
        growth: parseFloat(growth),
      },
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch user stats" }, { status: 500 });
  }
}
