export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(request) {
  try {
    const { fullName, email, password } = await request.json();

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: "Full name, email and password are required" }, { status: 400 });
    }

    // Extract first name as username (before the first space)
    const username = fullName.trim().split(" ")[0];

    if (username.length < 3) {
      return NextResponse.json({ error: "First name must be at least 3 characters" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const pool = getDb();

    // Ensure roles table exists
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        role_name VARCHAR(100) NOT NULL,
        description VARCHAR(255)
      )
    `);

    // Ensure default role exists
    const [existingRole] = await pool.execute("SELECT id FROM roles WHERE id = 1 LIMIT 1");
    if (!existingRole || existingRole.length === 0) {
      await pool.execute("INSERT INTO roles (role_name, description) VALUES (?, ?)", ["default user", "Default user access"]);
    }

    // Check if username or email already exists
    const [existing] = await pool.execute("SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1", [username, email]);
    if (existing && existing.length > 0) {
      return NextResponse.json({ error: "Username or email already in use" }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 10);
    const displayName = fullName.trim();

    // Insert user with defaults: role_id=1, is_active=1
    const [result] = await pool.execute("INSERT INTO users (name, username, email, password_hash, role_id, is_active) VALUES (?, ?, ?, ?, ?, ?)", [
      displayName,
      username.toLowerCase(),
      email.trim(),
      hash,
      1,
      1,
    ]);

    const userId = result?.insertId;

    const user = {
      id: userId,
      username: username.toLowerCase(),
      email: email.trim(),
      name: displayName,
      roleId: 1,
    };

    const token = signToken({ id: user.id, roleId: user.roleId, username: user.username, email: user.email, name: user.name });

    const response = NextResponse.json({ success: true, user });
    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Register error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
