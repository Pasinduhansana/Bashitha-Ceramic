import { NextResponse } from "next/server";
import { ensurePermissionsSeed } from "@/lib/permissions";

/**
 * Initialize permissions and roles
 * Call this endpoint once to seed the database with user types and permissions
 * GET /api/init-permissions
 */
export async function GET() {
  try {
    await ensurePermissionsSeed();

    return NextResponse.json({
      success: true,
      message: "Permissions and roles initialized successfully",
      roles: ["System Admin", "Owner", "Sales Assistant", "Staff"],
      note: "User types and their permissions have been created according to the access matrix",
    });
  } catch (error) {
    console.error("Error initializing permissions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize permissions",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
