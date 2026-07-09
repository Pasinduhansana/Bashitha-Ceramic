import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCached, setCached, makeCacheKey } from "@/lib/apiCache";

// GET - Fetch all categories
export async function GET(request) {
  try {
    const cacheKey = makeCacheKey("categories", request);
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

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

    const payload = {
      categories: result.rows,
    };

    // Cache categories briefly; categories change rarely.
    setCached(cacheKey, payload, 60 * 1000); // 60s

    return NextResponse.json(payload);


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