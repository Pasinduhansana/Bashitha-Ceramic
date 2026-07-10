import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";
import { PERMISSIONS, PermissionError, requirePermission } from "@/lib/permissions";

// GET - Fetch all users
export async function GET(request) {
  try {
    try {
      await requirePermission(PERMISSIONS.MANAGE_USERS);
    } catch (err) {
      if (err instanceof PermissionError) {
        return NextResponse.json(
          {
            success: false,
            message: err.message,
          },
          {
            status: err.status,
          },
        );
      }

      throw err;
    }

    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    let sql = `
      SELECT 
        u.id,
        u.name,
        u.username,
        u.email,
        u.role_id,
        u.is_active,
        u.contact,
        u.address,
        u.img_url,
        u.created_at,
        u.updated_at,
        r.role_name
      FROM users u
      LEFT JOIN roles r 
        ON u.role_id = r.id
      WHERE 1=1
    `;

    const params = [];

    if (status && status !== "all") {
      sql += `
        AND u.is_active = ?
      `;

      params.push(status === "active" ? 1 : 0);
    }

    if (role && role !== "all") {
      sql += `
        AND u.role_id = ?
      `;

      params.push(Number(role));
    }

    if (search) {
      sql += `
        AND (
          u.name LIKE ?
          OR u.email LIKE ?
          OR u.username LIKE ?
        )
      `;

      const searchTerm = `%${search}%`;

      params.push(searchTerm, searchTerm, searchTerm);
    }

    sql += `
      ORDER BY u.created_at DESC
    `;

    const db = getDb();

    const result = await db.execute({
      sql,
      args: params,
    });

    const users = result.rows.map((user) => ({
      ...user,
      password_hash: undefined,
    }));

    return NextResponse.json({
      success: true,
      users,
      total: users.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
      },
      {
        status: 500,
      },
    );
  }
}

// POST - Create user
export async function POST(request) {
  try {
    try {
      await requirePermission(PERMISSIONS.MANAGE_USERS);
    } catch (err) {
      if (err instanceof PermissionError) {
        return NextResponse.json(
          {
            success: false,
            message: err.message,
          },
          {
            status: err.status,
          },
        );
      }

      throw err;
    }

    const body = await request.json();

    const { name, username, email, password, role_id, contact, address } = body;

    if (!name || !username || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        {
          status: 400,
        },
      );
    }

    const db = getDb();

    // Check existing user
    const existingResult = await db.execute({
      sql: `
        SELECT id
        FROM users
        WHERE email = ?
        OR username = ?
      `,

      args: [email, username],
    });

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User with this email or username already exists",
        },
        {
          status: 400,
        },
      );
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await db.execute({
      sql: `
        INSERT INTO users
        (
          name,
          username,
          email,
          password_hash,
          role_id,
          is_active,
          contact,
          address,
          created_at,
          updated_at
        )
        VALUES
        (
          ?,?,?,?,?,1,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
        )
      `,

      args: [name, username, email, password_hash, role_id || 2, contact || null, address || null],
    });

    const userId = Number(result.lastInsertRowid);

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      userId,
    });
  } catch (error) {
    console.error("Error creating user:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create user",
      },
      {
        status: 500,
      },
    );
  }
}
