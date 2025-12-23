export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";

export async function POST(request) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const pool = getDb();

    // Validate token
    const [rows] = await pool.execute("SELECT prt.userId FROM password_reset_tokens prt WHERE prt.token = ? AND prt.expiresAt > NOW() LIMIT 1", [
      token,
    ]);
    const row = rows?.[0];
    if (!row) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 10);

    // Update password and cleanup token
    await pool.execute("UPDATE users SET password_hash = ? WHERE id = ?", [hash, row.userId]);
    await pool.execute("DELETE FROM password_reset_tokens WHERE userId = ?", [row.userId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset-password error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
