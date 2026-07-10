import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { PERMISSIONS, PermissionError, requirePermission } from "@/lib/permissions";
import { getCached, setCached, makeCacheKey } from "@/lib/apiCache";

// GET - Fetch all products with category info
export async function GET(request) {
  const start = Date.now();

  try {
    console.log("\n---- PRODUCTS API START ----");

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 50);

    const offset = (page - 1) * limit;

    console.log("1. Params parsed:", Date.now() - start, "ms");

    const cacheKey = makeCacheKey("products", request, `${search}|${category}|${status}|${page}|${limit}`);

    const cached = getCached(cacheKey);

    if (cached) {
      console.log("2. Cache hit:", Date.now() - start, "ms");

      return NextResponse.json(cached);
    }

    console.log("2. Cache miss:", Date.now() - start, "ms");

    // Permission check
    const permissionStart = Date.now();

    try {
      await requirePermission(PERMISSIONS.VIEW_PRODUCTS);
    } catch (err) {
      if (err instanceof PermissionError) {
        return NextResponse.json(
          {
            error: err.message,
          },
          {
            status: err.status,
          },
        );
      }

      throw err;
    }

    console.log("3. Permission completed:", Date.now() - permissionStart, "ms");

    const db = getDb();

    const queryStart = Date.now();

    let query = `

      SELECT

        p.id,
        p.product_type,
        p.name,
        p.brand,
        p.code,
        p.new_code,
        p.shade,
        p.size,
        p.photo_url,
        p.qty,
        p.unit,
        p.cost_price,
        p.selling_price,
        p.reorder_level,
        p.category_id,
        p.updated_at,

        c.name AS category_name

      FROM products p

      LEFT JOIN categories c
        ON p.category_id = c.id

      WHERE 1=1

    `;

    const params = [];

    if (search) {
      query += `

        AND (

          p.name LIKE ?
          OR p.code LIKE ?
          OR p.brand LIKE ?

        )

      `;

      const value = `${search}%`;

      params.push(value, value, value);
    }

    if (category) {
      query += `
        AND c.name = ?
      `;

      params.push(category);
    }

    if (status === "out_of_stock") {
      query += `
        AND p.qty = 0
      `;
    } else if (status === "low_stock") {
      query += `
        AND p.qty > 0
        AND p.qty <= p.reorder_level
      `;
    } else if (status === "in_stock") {
      query += `
        AND p.qty > p.reorder_level
      `;
    }

    query += `

      ORDER BY p.updated_at DESC

      LIMIT ?

      OFFSET ?

    `;

    params.push(limit, offset);

    const result = await db.execute({
      sql: query,

      args: params,
    });

    console.log("4. Database query:", Date.now() - queryStart, "ms");

    const payload = {
      products: result.rows,

      pagination: {
        page,
        limit,
        count: result.rows.length,
      },
    };

    setCached(cacheKey, payload, 30000);

    console.log("5. Total API:", Date.now() - start, "ms");

    console.log("---- PRODUCTS API END ----\n");

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Products API error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch products",
      },

      {
        status: 500,
      },
    );
  }
}

// POST - Create new product
export async function POST(request) {
  try {
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

    const result = await db.execute({
      sql: `
        INSERT INTO products
        (
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
          created_at,
          updated_at
        )
        VALUES
        (
          ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
      `,

      args: [
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
      ],
    });

    const product_id = Number(result.lastInsertRowid);

    // Log initial stock
    if (qty > 0) {
      await db.execute({
        sql: `
          INSERT INTO stock_logs
          (
            product_id,
            action,
            qty,
            user_id,
            created_at
          )
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `,

        args: [product_id, "INITIAL_STOCK", qty, user?.id || null],
      });
    }

    // Audit log
    if (user) {
      await db.execute({
        sql: `
          INSERT INTO audit_logs
          (
            user_id,
            action,
            table_name,
            record_id,
            timestamp
          )
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `,

        args: [user.id, "CREATE_PRODUCT", "products", product_id],
      });
    }

    return NextResponse.json({
      success: true,
      product_id,
    });
  } catch (error) {
    console.error("Error creating product:", error);

    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
