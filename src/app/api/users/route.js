import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";
import { PERMISSIONS, PermissionError, requirePermission } from "@/lib/permissions";

export async function GET(request) {
  try {
    // Only roles with MANAGE_USERS can access the user list
    try {
      await requirePermission(PERMISSIONS.MANAGE_USERS);
    } catch (err) {
      if (err instanceof PermissionError) {
        return NextResponse.json({ success: false, message: err.message }, { status: err.status });
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
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by status
    if (status && status !== "all") {
      sql += " AND u.is_active = $" + (params.length + 1);
      params.push(status === "active" ? 1 : 0);
    }

    // Filter by role
    if (role && role !== "all") {
      sql += " AND u.role_id = $" + (params.length + 1);
      params.push(parseInt(role));
    }

    // Search by name, email, or username
    if (search) {
      const paramIndex = params.length + 1;
      sql += ` AND (u.name LIKE $${paramIndex} OR u.email LIKE $${paramIndex + 1} OR u.username LIKE $${paramIndex + 2})`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    sql += " ORDER BY u.created_at DESC";

    const db = getDb();
    const { rows: users } = await db.query(sql, params);

    // Don't send password hashes to client
    const sanitizedUsers = users.map((user) => ({
      ...user,
      password_hash: undefined,
    }));

    return NextResponse.json({
      success: true,
      users: sanitizedUsers,
      total: sanitizedUsers.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // Only roles with MANAGE_USERS can create users
    try {
      await requirePermission(PERMISSIONS.MANAGE_USERS);
    } catch (err) {
      if (err instanceof PermissionError) {
        return NextResponse.json({ success: false, message: err.message }, { status: err.status });
      }
      throw err;
    }

    const body = await request.json();
    const { name, username, email, password, role_id, contact, address } = body;

    // Validate required fields
    if (!name || !username || !email || !password) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists
    const db = getDb();
    const { rows: existingUsers } = await db.query("SELECT id FROM users WHERE email = $1 OR username = $2", [email, username]);

    if (existingUsers.length > 0) {
      return NextResponse.json({ success: false, message: "User with this email or username already exists" }, { status: 400 });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert new user
    const { rows } = await db.query(
      `INSERT INTO users (name, username, email, password_hash, role_id, is_active, contact, address, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 1, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id`,
      [name, username, email, password_hash, role_id || 2, contact || null, address || null],
    );

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      userId: rows[0].id,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ success: false, message: "Failed to create user" }, { status: 500 });
  }
}
