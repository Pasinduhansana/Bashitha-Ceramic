import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // TODO: Replace with actual database validation
    // Example: await validateUser(email, password)

    if (email === "admin@bashitha.com" && password === "admin123") {
      const user = {
        id: "1",
        email,
        name: "Admin User",
        role: "admin",
      };

      return NextResponse.json({
        success: true,
        user,
      });
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
