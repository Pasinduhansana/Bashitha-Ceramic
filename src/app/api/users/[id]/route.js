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

    const [users] = await db.execute(
      `SELECT 
        u.id, u.name, u.username, u.email, u.role_id, u.is_active, 
        u.contact, u.address, u.created_at, u.updated_at,
        r.role_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [id]
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
    const { name, username, email, role_id, contact, address } = body;
    const db = getDb();

    // Check if user exists
    const [existingUsers] = await db.execute("SELECT id FROM users WHERE id = ?", [id]);
    if (existingUsers.length === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Check for duplicate email/username (excluding current user)
    const [duplicates] = await db.execute("SELECT id FROM users WHERE (email = ? OR username = ?) AND id != ?", [email, username, id]);

    if (duplicates.length > 0) {
      return NextResponse.json({ success: false, message: "Email or username already in use" }, { status: 400 });
    }

    // Update user
    await db.execute(
      `UPDATE users 
       SET name = ?, username = ?, email = ?, role_id = ?, contact = ?, address = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, username, email, role_id, contact, address, id]
    );

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
    const [existingUsers] = await db.execute("SELECT id FROM users WHERE id = ?", [id]);
    if (existingUsers.length === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Delete user
    await db.execute("DELETE FROM users WHERE id = ?", [id]);

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
    const [existingUsers] = await db.execute("SELECT id FROM users WHERE id = ?", [id]);
    if (existingUsers.length === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Update user status
    await db.execute("UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ?", [is_active ? 1 : 0, id]);

    return NextResponse.json({
      success: true,
      message: `User ${is_active ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    return NextResponse.json({ success: false, message: "Failed to update user status" }, { status: 500 });
  }
}
