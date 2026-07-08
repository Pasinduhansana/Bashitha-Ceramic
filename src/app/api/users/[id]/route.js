import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { PERMISSIONS, PermissionError, requirePermission } from "@/lib/permissions";

export async function GET(request, { params }) {
  try {
    // Require manage users permission
    try {
      await requirePermission(PERMISSIONS.MANAGE_USERS);
    } catch (err) {
      if (err instanceof PermissionError) {
        return NextResponse.json({ success: false, message: err.message }, { status: err.status });
      }
      throw err;
    }

    const { id } = await params;
    const db = getDb();

    const { rows: users } = await db.query(
      `SELECT 
        u.id, u.name, u.username, u.email, u.role_id, u.is_active, 
        u.contact, u.address, u.created_at, u.updated_at,
        r.role_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [id],
    );

    if (users.length === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: users[0],
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    let currentUser = null;
    try {
      currentUser = await requirePermission(PERMISSIONS.MANAGE_USERS);
    } catch (err) {
      if (err instanceof PermissionError) {
        return NextResponse.json({ success: false, message: err.message }, { status: err.status });
      }
      throw err;
    }

    const { id } = await params;
    const body = await request.json();
    const { name, username, email, role_id, contact, address } = body;
    const db = getDb();

    // Check if user exists
    const { rows: existingUsers } = await db.query("SELECT id FROM users WHERE id = $1", [id]);
    if (existingUsers.length === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Check for duplicate email/username (excluding current user)
    const { rows: duplicates } = await db.query("SELECT id FROM users WHERE (email = $1 OR username = $2) AND id != $3", [email, username, id]);

    if (duplicates.length > 0) {
      return NextResponse.json({ success: false, message: "Email or username already in use" }, { status: 400 });
    }

    // Update user
    await db.query(
      `UPDATE users 
       SET name = $1, username = $2, email = $3, role_id = $4, contact = $5, address = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7`,
      [name, username, email, role_id, contact, address, id],
    );

    // Log audit
    if (currentUser) {
      await db.query(
        `INSERT INTO audit_logs (user_id, action, table_name, record_id, timestamp) VALUES ($1, 'UPDATE_USER', 'users', $2, CURRENT_TIMESTAMP)`,
        [currentUser.id, id],
      );
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ success: false, message: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    try {
      await requirePermission(PERMISSIONS.MANAGE_USERS);
    } catch (err) {
      if (err instanceof PermissionError) {
        return NextResponse.json({ success: false, message: err.message }, { status: err.status });
      }
      throw err;
    }

    const { id } = await params;
    const db = getDb();

    // Check if user exists
    const { rows: existingUsers } = await db.query("SELECT id FROM users WHERE id = $1", [id]);
    if (existingUsers.length === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Delete user
    await db.query("DELETE FROM users WHERE id = $1", [id]);

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ success: false, message: "Failed to delete user" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    try {
      await requirePermission(PERMISSIONS.MANAGE_USERS);
    } catch (err) {
      if (err instanceof PermissionError) {
        return NextResponse.json({ success: false, message: err.message }, { status: err.status });
      }
      throw err;
    }

    const { id } = await params;
    const body = await request.json();
    const { is_active } = body;
    const db = getDb();

    // Check if user exists
    const { rows: existingUsers } = await db.query("SELECT id FROM users WHERE id = $1", [id]);
    if (existingUsers.length === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Update user status
    await db.query("UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [is_active ? 1 : 0, id]);

    return NextResponse.json({
      success: true,
      message: `User ${is_active ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    return NextResponse.json({ success: false, message: "Failed to update user status" }, { status: 500 });
  }
}
