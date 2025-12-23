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
    const [users] = await db.execute(
      `SELECT 
        u.id, u.name, u.username, u.email, u.contact, u.address, u.img_url, u.created_at,
        r.role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?`,
      [payload.id]
    );

    if (users.length === 0) {
      return NextResponse.json({ user: null }, { status: 404 });
    }

    const user = users[0];
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
      },
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}

export async function PUT(request) {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, phone, address, img_url } = body;

    const db = getDb();
    await db.execute(`UPDATE users SET name = ?, contact = ?, address = ?, img_url = ?, updated_at = NOW() WHERE id = ?`, [
      name,
      phone || null,
      address || null,
      img_url || null,
      payload.id,
    ]);

    return NextResponse.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
