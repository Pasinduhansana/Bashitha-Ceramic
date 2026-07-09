import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(request) {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const payload = verifyToken(token);

  if (!payload) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const db = getDb();

    // Fetch user details with role
    const userResult = await db.execute({
      sql: `
        SELECT 
          u.id,
          u.name,
          u.username,
          u.email,
          u.contact,
          u.address,
          u.img_url,
          u.created_at,
          r.role_name
        FROM users u
        LEFT JOIN roles r 
          ON u.role_id = r.id
        WHERE u.id = ?
      `,
      args: [payload.id],
    });

    const users = userResult.rows;

    if (users.length === 0) {
      return NextResponse.json(
        { user: null },
        { status: 404 }
      );
    }

    const user = users[0];


    // Fetch role-based permissions
    const rolePermResult = await db.execute({
      sql: `
        SELECT 
          p.permission_key
        FROM role_permissions rp
        JOIN permissions p 
          ON rp.permission_id = p.id
        WHERE rp.role_id = (
          SELECT role_id 
          FROM users 
          WHERE id = ?
        )
      `,
      args: [user.id],
    });

    const rolePermissions = rolePermResult.rows.map(
      (row) => row.permission_key
    );


    // Fetch user permission overrides
    const userPermResult = await db.execute({
      sql: `
        SELECT 
          p.permission_key,
          up.is_allowed
        FROM user_permissions up
        JOIN permissions p 
          ON up.permission_id = p.id
        WHERE up.user_id = ?
      `,
      args: [user.id],
    });


    // Apply permission overrides
    let permissions = new Set(rolePermissions);

    for (const row of userPermResult.rows) {
      if (Number(row.is_allowed) === 1) {
        permissions.add(row.permission_key);
      } else {
        permissions.delete(row.permission_key);
      }
    }


    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.contact,
        address: user.address,
        img_url: user.img_url || null,
        role: user.role_name || "User",
        created_at: user.created_at,
        permissions: Array.from(permissions),
      },
    });

  } catch (error) {
    console.error("Error fetching user details:", error);

    return NextResponse.json(
      { user: null },
      { status: 500 }
    );
  }
}


export async function PUT(request) {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const payload = verifyToken(token);

  if (!payload) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }


  try {
    const body = await request.json();

    const {
      name,
      phone,
      address,
      img_url
    } = body;


    const db = getDb();


    await db.execute({
      sql: `
        UPDATE users
        SET 
          name = ?,
          contact = ?,
          address = ?,
          img_url = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [
        name,
        phone || null,
        address || null,
        img_url || null,
        payload.id,
      ],
    });


    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });


  } catch (error) {

    console.error(
      "Error updating profile:",
      error
    );

    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}