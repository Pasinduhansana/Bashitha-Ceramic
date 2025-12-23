export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getDb } from "@/lib/db";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { username } = await request.json();
    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const pool = getDb();

    // Find user
    const [users] = await pool.execute("SELECT id, username FROM users WHERE username = ? LIMIT 1", [username]);
    const user = users?.[0];

    // Respond with success regardless, to avoid user enumeration
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Generate secure token and expiry (30 minutes)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    // Ensure table exists (best effort for dev environments)
    await pool.query(
      "CREATE TABLE IF NOT EXISTS password_reset_tokens (\n        id INT AUTO_INCREMENT PRIMARY KEY,\n        userId INT NOT NULL,\n        token VARCHAR(128) NOT NULL,\n        expiresAt DATETIME NOT NULL,\n        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n        INDEX(token),\n        INDEX(userId)\n      ) ENGINE=InnoDB"
    );

    // Upsert: delete old tokens for user, then insert new
    await pool.execute("DELETE FROM password_reset_tokens WHERE userId = ?", [user.id]);
    await pool.execute("INSERT INTO password_reset_tokens (userId, token, expiresAt) VALUES (?, ?, ?)", [user.id, token, expiresAt]);

    // Send email to fixed recipient with reset link
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const resetLink = `${appUrl}/forgot-password?token=${token}`;

    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.SMTP_FROM) {
      console.error("Forgot-password error: missing SMTP envs");
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: "gallagepasinduhansana@gmail.com",
      subject: "Reset your password",
      text: `Hello ${user.username},\n\nUse the link below to reset your password:\n${resetLink}\n\nThis link expires in 30 minutes.`,
      html: `<p>Hello ${user.username},</p><p>Use the link below to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link expires in 30 minutes.</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot-password error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
