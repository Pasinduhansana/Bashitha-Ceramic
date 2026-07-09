//This file is used to test the connection to the Turso database. Delete this file after testing the connection.
import "dotenv/config";
import { getDb } from "./lib/db.js";

async function testConnection() {
  try {
    const db = getDb();

    const result = await db.execute("SELECT 1");

    console.log("✅ Turso connected successfully");
    console.log(result);

  } catch (error) {
    console.error("❌ Turso connection failed");
    console.error(error);
  }
}

testConnection();