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

    const logsWithDetails = await Promise.all(
      logs.map(async (log) => {
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

          // Fetch product details
          if (!productDetails) {
            try {
              const productResult = await db.execute({
                sql: `
                    SELECT 
                      p.*,
                      c.name AS category_name
                    FROM products p
                    LEFT JOIN categories c
                      ON p.category_id = c.id
                    WHERE p.id = ?
                  `,

                args: [log.record_id],
              });

              if (productResult.rows.length > 0) {
                productDetails = productResult.rows[0];

                if (log.action === "CREATE_PRODUCT") {
                  enhancedDetails = `Created product: ${productDetails.name}`;
                } else if (log.action === "UPDATE_PRODUCT") {
                  enhancedDetails = `Updated product: ${productDetails.name}`;
                } else if (log.action === "UPDATE_INVENTORY") {
                  const stockResult = await db.execute({
                    sql: `
                        SELECT 
                          qty,
                          action
                        FROM stock_logs
                        WHERE product_id = ?
                          AND user_id = ?
                        ORDER BY created_at DESC
                        LIMIT 1
                      `,

                    args: [log.record_id, log.user_id],
                  });

                  if (stockResult.rows.length > 0) {
                    const qtyChange = Number(stockResult.rows[0].qty);

                    const changeText = qtyChange > 0 ? `Added ${qtyChange}` : `Removed ${Math.abs(qtyChange)}`;

                    enhancedDetails = `Updated inventory: ${productDetails.name} (${changeText} ${productDetails.unit || "units"})`;
                  } else {
                    enhancedDetails = `Updated inventory: ${productDetails.name}`;
                  }
                }
              }
            } catch (err) {
              console.error(`Error fetching product details for record ${log.record_id}:`, err);
            }
          }
        }

        return {
          ...log,
          details: enhancedDetails,
          productDetails,
        };
      }),
    );

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
