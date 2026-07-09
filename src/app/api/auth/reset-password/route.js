export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        {
          error: "Token and password are required",
        },
        {
          status: 400,
        },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          error: "Password must be at least 6 characters",
        },
        {
          status: 400,
        },
      );
    }

    const db = getDb();

    // Validate reset token
    const tokenResult = await db.execute({
      sql: `
        SELECT 
          prt.userId
        FROM password_reset_tokens prt
        WHERE prt.token = ?
          AND prt.expiresAt > CURRENT_TIMESTAMP
        LIMIT 1
      `,

      args: [token],
    });

    const row = tokenResult.rows?.[0];

    if (!row) {
      return NextResponse.json(
        {
          error: "Invalid or expired token",
        },
        {
          status: 400,
        },
      );
    }

    const hash = await bcrypt.hash(password, 10);

    // Update password
    await db.execute({
      sql: `
        UPDATE users
        SET password_hash = ?
        WHERE id = ?
      `,

      args: [hash, row.userId],
    });

    // Delete used token
    await db.execute({
      sql: `
        DELETE FROM password_reset_tokens
        WHERE userId = ?
      `,

      args: [row.userId],
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Reset-password error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}
