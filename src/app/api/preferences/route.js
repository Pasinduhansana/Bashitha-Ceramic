import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET - Fetch user preferences
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "default";

    const db = await getDb();
    const [rows] = await db.execute(`SELECT preferences FROM user_preferences WHERE user_id = ?`, [userId]);

    if (rows.length > 0) {
      return NextResponse.json({ preferences: JSON.parse(rows[0].preferences) });
    }

    // Return default preferences if none found
    return NextResponse.json({
      preferences: {
        companyName: "Bashitha Ceramics",
        email: "contact@bashithaceramics.com",
        phone: "+94 71 234 5678",
        address: "123 Ceramic Street, Colombo, Sri Lanka",
        emailNotifications: true,
        pushNotifications: true,
        activityAlerts: true,
        lowStockAlerts: true,
        twoFactorAuth: false,
        sessionTimeout: 30,
        theme: "light",
        language: "English",
        displayLanguage: "english",
        dateFormat: "MM/DD/YYYY",
        currency: "USD",
        lowStockThreshold: 100,
        autoReorder: false,
        stockAlertLevel: 50,
      },
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
  }
}

// POST - Save user preferences
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId = "default", preferences } = body;

    const db = await getDb();

    // Check if preferences exist
    const [existing] = await db.execute(`SELECT id FROM user_preferences WHERE user_id = ?`, [userId]);

    if (existing.length > 0) {
      // Update existing preferences
      await db.execute(`UPDATE user_preferences SET preferences = ?, updated_at = NOW() WHERE user_id = ?`, [JSON.stringify(preferences), userId]);
    } else {
      // Insert new preferences
      await db.execute(`INSERT INTO user_preferences (user_id, preferences, created_at, updated_at) VALUES (?, ?, NOW(), NOW())`, [
        userId,
        JSON.stringify(preferences),
      ]);
    }

    // Also save displayLanguage to localStorage via response
    return NextResponse.json({
      success: true,
      message: "Preferences saved successfully",
      displayLanguage: preferences.displayLanguage,
    });
  } catch (error) {
    console.error("Error saving preferences:", error);
    return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 });
  }
}
