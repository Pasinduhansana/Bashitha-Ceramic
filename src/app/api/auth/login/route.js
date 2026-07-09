export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: "Username or email and password are required" }, { status: 400 });
    }

    // Check Turso environment variables
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      console.error("Login error: missing Turso environment variables");

      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const db = getDb();

    const result = await db.execute({
      sql: `
        SELECT 
          id,
          username,
          email,
          password_hash,
          role_id,
          name,
          is_active
        FROM users
        WHERE LOWER(username) = LOWER(?)
           OR LOWER(email) = LOWER(?)
        LIMIT 1
      `,
      args: [identifier, identifier],
    });

    const row = result.rows?.[0];

    if (!row) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (Number(row.is_active) === 0) {
      return NextResponse.json(
        {
          error: "Your login is not approved by Admin yet. Please wait for approval.",
        },
        { status: 403 },
      );
    }

    const storedHash = row.password_hash || row.passwordHash || row.PasswordHash || "";

    const isValid = storedHash ? await bcrypt.compare(password, storedHash) : false;

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const user = {
      id: row.id,
      username: row.username,
      email: row.email,
      name: row.name,
      roleId: row.role_id ?? row.roleId ?? row.role,
    };

    const token = signToken({
      id: user.id,
      roleId: user.roleId,
      username: user.username,
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      user,
    });

    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error?.message || error, error?.stack);

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
