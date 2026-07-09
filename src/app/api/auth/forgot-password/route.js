export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getDb } from "@/lib/db";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }


    const db = getDb();


    // Find user
    const userResult = await db.execute({
      sql: `
        SELECT 
          id,
          username
        FROM users
        WHERE username = ?
        LIMIT 1
      `,
      args: [username],
    });


    const user = userResult.rows?.[0];


    // Avoid user enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
      });
    }



    // Generate secure reset token
    const token = crypto
      .randomBytes(32)
      .toString("hex");


    const expiresAt = new Date(
      Date.now() + 30 * 60 * 1000
    ).toISOString();



    // Create reset token table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        token TEXT NOT NULL,
        expiresAt DATETIME NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);



    // Create indexes
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_password_reset_token
      ON password_reset_tokens(token)
    `);


    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_password_reset_userId
      ON password_reset_tokens(userId)
    `);



    // Remove old tokens
    await db.execute({
      sql: `
        DELETE FROM password_reset_tokens
        WHERE userId = ?
      `,
      args: [
        user.id,
      ],
    });



    // Insert new token
    await db.execute({
      sql: `
        INSERT INTO password_reset_tokens
        (
          userId,
          token,
          expiresAt
        )
        VALUES (?, ?, ?)
      `,
      args: [
        user.id,
        token,
        expiresAt,
      ],
    });



    // Generate reset link
    const appUrl =
      process.env.APP_URL ||
      "http://localhost:3000";


    const resetLink =
      `${appUrl}/forgot-password?token=${token}`;



    // Validate SMTP config
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_PORT ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS ||
      !process.env.SMTP_FROM
    ) {

      console.error(
        "Forgot-password error: missing SMTP envs"
      );

      return NextResponse.json(
        {
          error: "Email service not configured",
        },
        {
          status: 500,
        }
      );

    }



    const transporter =
      nodemailer.createTransport({

        host: process.env.SMTP_HOST,

        port: Number(
          process.env.SMTP_PORT
        ),

        secure:
          Number(process.env.SMTP_PORT) === 465,

        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },

      });



    await transporter.sendMail({

      from: process.env.SMTP_FROM,

      to: "gallagepasinduhansana@gmail.com",

      subject: "Reset your password",

      text:
`Hello ${user.username},

Use the link below to reset your password:

${resetLink}

This link expires in 30 minutes.`,


      html:
`
<p>Hello ${user.username},</p>

<p>
Use the link below to reset your password:
</p>

<p>
<a href="${resetLink}">
${resetLink}
</a>
</p>

<p>
This link expires in 30 minutes.
</p>
`,

    });



    return NextResponse.json({
      success: true,
    });


  } catch (error) {

    console.error(
      "Forgot-password error:",
      error
    );


    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );

  }
}