import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { PERMISSIONS, PermissionError, requirePermission } from "@/lib/permissions";

// GET - Fetch all products with category info
export async function GET(request) {
  try {
    // Viewing products requires VIEW_PRODUCTS permission
    try {
      await requirePermission(PERMISSIONS.VIEW_PRODUCTS);
    } catch (err) {
      if (err instanceof PermissionError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";

    const db = getDb();

    let query = `
      SELECT 
        p.*,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (p.name LIKE ? OR p.code LIKE ? OR p.brand LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (category) {
      query += ` AND c.name = ?`;
      params.push(category);
    }

    // Status filtering based on stock levels
    if (status === "out_of_stock") {
      query += ` AND p.qty = 0`;
    } else if (status === "low_stock") {
      query += ` AND p.qty > 0 AND p.qty <= p.reorder_level`;
    } else if (status === "in_stock") {
      query += ` AND p.qty > p.reorder_level`;
    }

    query += ` ORDER BY p.updated_at DESC`;

    const [products] = await db.execute(query, params);

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST - Create new product
export async function POST(request) {
  try {
    // Adding / editing products requires EDIT_PRODUCTS permission
    let user = null;
    try {
      user = await requirePermission(PERMISSIONS.EDIT_PRODUCTS);
    } catch (err) {
      if (err instanceof PermissionError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }

    const body = await request.json();
    const {
      product_type,
      name,
      brand,
      code,
      new_code,
      shade,
      new_shade,
      size,
      photo_url,
      qty,
      unit,
      cost_price,
      selling_price,
      reorder_level,
      category_id,
      description,
    } = body;

    const db = getDb();

    // Insert product
    const [result] = await db.execute(
      `INSERT INTO products 
       (product_type, name, brand, code, new_code, shade, new_shade, size, photo_url, qty, unit, cost_price, selling_price, reorder_level, category_id, description, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        product_type || null,
        name,
        brand || null,
        code || null,
        new_code || null,
        shade || null,
        new_shade || null,
        size || null,
        photo_url || null,
        qty || 0,
        unit || "Pcs",
        cost_price || 0,
        selling_price || 0,
        reorder_level || 100,
        category_id || null,
        description || null,
      ]
    );

    const product_id = result.insertId;

    // Log initial stock if qty > 0
    if (qty > 0) {
      await db.execute(`INSERT INTO stock_logs (product_id, action, qty, user_id, created_at) VALUES (?, 'INITIAL_STOCK', ?, ?, NOW())`, [
        product_id,
        qty,
        user?.id || null,
      ]);
    }

    // Log audit
    if (user) {
      await db.execute(
        `INSERT INTO audit_logs (user_id, action, table_name, record_id, timestamp) VALUES (?, 'CREATE_PRODUCT', 'products', ?, NOW())`,
        [user.id, product_id]
      );
    }

    return NextResponse.json({ success: true, product_id });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
