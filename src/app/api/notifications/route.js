import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";


// GET - Fetch unread notifications for the current user
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token");

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token.value);
    const userId = decoded.id;

    const db = getDb();


    const result = await db.execute({
      sql: `
        SELECT 
          a.*,
          u.name AS user_name,
          u.img_url AS user_img_url
        FROM audit_logs a
        LEFT JOIN users u 
          ON a.user_id = u.id
        LEFT JOIN notification_reads nr 
          ON a.id = nr.notification_id 
          AND nr.user_id = ?
        WHERE nr.id IS NULL
        ORDER BY a.timestamp DESC
        LIMIT 50
      `,
      args: [userId],
    });


    const notifications = result.rows.map((log) => ({
      id: log.id,
      action: log.action,
      table_name: log.table_name,
      record_id: log.record_id,
      timestamp: log.timestamp,
      user_name: log.user_name,
      user_img_url: log.user_img_url,
      description: `${log.action.replace(/_/g, " ")} on ${log.table_name}`,
    }));


    return NextResponse.json({
      notifications,
      count: notifications.length,
    });


  } catch (error) {
    console.error("Error fetching notifications:", error);

    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}



// POST - Mark notification as read
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token");

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }


    const decoded = verifyToken(token.value);
    const userId = decoded.id;


    const { notificationId } = await request.json();


    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }


    const db = getDb();


    // Turso(SQLite) does not support PostgreSQL ON CONFLICT DO UPDATE syntax exactly
    await db.execute({
      sql: `
        INSERT INTO notification_reads
        (
          user_id,
          notification_id,
          read_at
        )
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id, notification_id)
        DO UPDATE SET read_at = CURRENT_TIMESTAMP
      `,
      args: [
        userId,
        notificationId
      ],
    });



    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
    });


  } catch (error) {
    console.error("Error marking notification as read:", error);

    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}