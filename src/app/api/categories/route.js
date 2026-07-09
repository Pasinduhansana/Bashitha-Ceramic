import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET - Fetch all categories
export async function GET(request) {
  try {
    const db = getDb();

    const result = await db.execute({
      sql: `
        SELECT 
          id,
          name
        FROM categories
        ORDER BY name ASC
      `,
      args: [],
    });

    return NextResponse.json({
      categories: result.rows,
    });

  } catch (error) {
    console.error(
      "Error fetching categories:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch categories",
      },
      {
        status: 500,
      }
    );
  }
}