import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { PERMISSIONS, PermissionError, requirePermission } from "@/lib/permissions";

// GET - Fetch audit logs
export async function GET(request) {
  try {
    // Only roles with VIEW_AUDIT_LOGS can access audit logs
    try {
      await requirePermission(PERMISSIONS.VIEW_AUDIT_LOGS);
    } catch (err) {
      if (err instanceof PermissionError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }

    const { searchParams } = new URL(request.url);

    const action = searchParams.get("action");
    const search = searchParams.get("search");
    const limit = Number(searchParams.get("limit") || 100);

    const db = getDb();

    let query = `
      SELECT 
        a.*,
        u.name AS user_name,
        u.img_url AS user_img_url
      FROM audit_logs a
      LEFT JOIN users u 
        ON a.user_id = u.id
      WHERE 1=1
    `;

    const args = [];

    if (action && action !== "all") {
      query += ` AND a.action LIKE ?`;
      args.push(`${action}%`);
    }

    if (search) {
      query += `
        AND (
          u.name LIKE ?
          OR a.action LIKE ?
        )
      `;

      args.push(`%${search}%`, `%${search}%`);
    }

    query += `
      ORDER BY a.timestamp DESC
      LIMIT ?
    `;

    args.push(limit);

    const auditResult = await db.execute({
      sql: query,
      args,
    });

    const logs = auditResult.rows;

    // ---- Performance fix: remove N+1 queries by batching lookups ----
    // Collect product ids we need.
    const productIdsToFetch = Array.from(
      new Set(
        logs
          .filter(
            (log) =>
              (log.action === "CREATE_PRODUCT" ||
                log.action === "UPDATE_PRODUCT" ||
                log.action === "DELETE_PRODUCT" ||
                log.action === "UPDATE_INVENTORY") &&
              log.table_name === "products" &&
              log.record_id,
          )
          .map((log) => Number(log.record_id)),
      ),
    );

    // Batch fetch products + category once.
    const productById = new Map();
    if (productIdsToFetch.length > 0) {
      const placeholders = productIdsToFetch.map(() => "?").join(",");
      const productResult = await db.execute({
        sql: `
          SELECT 
            p.*,
            c.name AS category_name
          FROM products p
          LEFT JOIN categories c
            ON p.category_id = c.id
          WHERE p.id IN (${placeholders})
        `,
        args: productIdsToFetch,
      });

      for (const p of productResult.rows) {
        productById.set(Number(p.id), p);
      }
    }

    // For UPDATE_INVENTORY we also need the latest stock_logs per (product_id, user_id).
    // Since SQLite/Turso doesn’t provide a simple DISTINCT ON, do a batched query on all pairs,
    // then pick the newest in memory.
    const inventoryPairs = Array.from(
      new Set(
        logs
          .filter(
            (log) =>
              log.action === "UPDATE_INVENTORY" &&
              log.table_name === "products" &&
              log.record_id &&
              log.user_id,
          )
          .map((log) => `${Number(log.record_id)}::${Number(log.user_id)}`),
      ),
    );

    const stockBestByPair = new Map();
    if (inventoryPairs.length > 0) {
      const pairConditions = inventoryPairs.map((p) => {
        const [productId, userId] = p.split("::").map(Number);
        return `(product_id = ? AND user_id = ?)`;
      });

      const stockArgs = inventoryPairs.flatMap((p) => {
        const [productId, userId] = p.split("::").map(Number);
        return [productId, userId];
      });

      const stockResult = await db.execute({
        sql: `
          SELECT 
            product_id,
            user_id,
            qty,
            action,
            created_at
          FROM stock_logs
          WHERE ${pairConditions.join(" OR ")}
          ORDER BY created_at DESC
        `,
        args: stockArgs,
      });

      // Pick first row per pair (because sorted by created_at DESC)
      for (const row of stockResult.rows) {
        const key = `${Number(row.product_id)}::${Number(row.user_id)}`;
        if (!stockBestByPair.has(key)) {
          stockBestByPair.set(key, row);
        }
      }
    }

    // NOTE: no Promise.all + no per-log awaits here.
    // All DB queries were already batched above; remaining work is pure in-memory mapping.
    const logsWithDetails = logs.map((log) => {
      let productDetails = null;
      let enhancedDetails = log.details;

      if (
        (log.action === "CREATE_PRODUCT" ||
          log.action === "UPDATE_PRODUCT" ||
          log.action === "DELETE_PRODUCT" ||
          log.action === "UPDATE_INVENTORY") &&
        log.table_name === "products" &&
        log.record_id
      ) {

        // Handle delete product using old data
        if (log.action === "DELETE_PRODUCT" && log.old_data) {
          try {
            productDetails = JSON.parse(log.old_data);
            enhancedDetails = `Deleted product: ${productDetails.name}`;
          } catch (err) {
            console.error("Error parsing old_data:", err);
          }
        }

        // Use batched product map for the remaining cases
        if (!productDetails) {
          productDetails = productById.get(Number(log.record_id)) || null;
        }

        if (productDetails) {
          if (log.action === "CREATE_PRODUCT") {
            enhancedDetails = `Created product: ${productDetails.name}`;
          } else if (log.action === "UPDATE_PRODUCT") {
            enhancedDetails = `Updated product: ${productDetails.name}`;
          } else if (log.action === "UPDATE_INVENTORY") {
            const pairKey = `${Number(log.record_id)}::${Number(log.user_id)}`;
            const stockRow = stockBestByPair.get(pairKey);

            if (stockRow) {
              const qtyChange = Number(stockRow.qty);
              const changeText = qtyChange > 0 ? `Added ${qtyChange}` : `Removed ${Math.abs(qtyChange)}`;
              enhancedDetails = `Updated inventory: ${productDetails.name} (${changeText} ${productDetails.unit || "units"})`;
            } else {
              enhancedDetails = `Updated inventory: ${productDetails.name}`;
            }
          }
        }
      }

      return {
        ...log,
        details: enhancedDetails,
        productDetails,
      };
    });


    return NextResponse.json({
      logs: logsWithDetails,
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch audit logs",
      },
      {
        status: 500,
      },
    );
  }
}
