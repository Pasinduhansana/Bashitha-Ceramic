import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET - Fetch all categories
export async function GET(request) {
  try {
    const db = await getDb();

    // Fetch all categories
    const [categories] = await db.execute(`SELECT id, name FROM categories ORDER BY name ASC`);

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
