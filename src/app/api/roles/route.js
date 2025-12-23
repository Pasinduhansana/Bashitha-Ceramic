import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const [roles] = await db.execute("SELECT id, role_name FROM roles ORDER BY id ASC");
    return NextResponse.json({ success: true, roles });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch roles" }, { status: 500 });
  }
}
