import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { PERMISSIONS, PermissionError, requirePermission } from "@/lib/permissions";

export async function GET() {

  try {


    try {

      await requirePermission(
        PERMISSIONS.MANAGE_USERS
      );

    } catch (err) {

      if (err instanceof PermissionError) {

        return NextResponse.json(
          {
            success: false,
            message: err.message,
          },
          {
            status: err.status,
          }
        );

      }

      throw err;

    }





    const db = getDb();



    const result = await db.execute({

      sql: `
        SELECT 
          COUNT(*) AS total_users,

          SUM(
            CASE 
              WHEN is_active = 1 
              THEN 1 
              ELSE 0 
            END
          ) AS active_users,

          SUM(
            CASE 
              WHEN is_active = 0 
              THEN 1 
              ELSE 0 
            END
          ) AS inactive_users,

          SUM(
            CASE 
              WHEN DATE(created_at) = DATE('now')
              THEN 1 
              ELSE 0 
            END
          ) AS new_today,


          SUM(
            CASE 
              WHEN DATE(created_at) >= DATE('now','-1 month')
              THEN 1 
              ELSE 0 
            END
          ) AS new_this_month,


          SUM(
            CASE 
              WHEN DATE(created_at) >= DATE('now','-2 months')
              AND DATE(created_at) < DATE('now','-1 month')
              THEN 1 
              ELSE 0 
            END
          ) AS new_last_month


        FROM users
      `,

      args: [],

    });





    const stats = result.rows[0];



    const growth =
      Number(stats.new_last_month) > 0
        ? (
            (
              (Number(stats.new_this_month) -
                Number(stats.new_last_month)) /
              Number(stats.new_last_month)
            ) * 100
          ).toFixed(1)
        : 0;






    return NextResponse.json({

      success: true,

      stats: {

        totalUsers: Number(stats.total_users),

        activeUsers: Number(stats.active_users),

        inactiveUsers: Number(stats.inactive_users),

        newToday: Number(stats.new_today),

        growth: parseFloat(growth),

      },

    });





  } catch (error) {

    console.error("Error fetching user stats:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch user stats",
      },
      {
        status: 500,
      }
    );

  }

}