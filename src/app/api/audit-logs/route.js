import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { PERMISSIONS, PermissionError, requirePermission } from "@/lib/permissions";

// GET - Fetch audit logs
export async function GET(request) {
  try {
    // Only roles with VIEW_AUDIT_LOGS can access audit logs
    let user = null;
    try {
      user = await requirePermission(PERMISSIONS.VIEW_AUDIT_LOGS);
    } catch (err) {
      if (err instanceof PermissionError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const search = searchParams.get("search");
    const limit = searchParams.get("limit") || 100;

    const db = getDb();
    let query = `
      SELECT 
        a.*,
        u.name as user_name,
        u.img_url as user_img_url
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (action && action !== "all") {
      query += ` AND a.action LIKE ?`;
      params.push(`${action}%`);
    }

    if (search) {
      query += ` AND (u.name LIKE ? OR a.action LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY a.timestamp DESC LIMIT ${parseInt(limit)}`;

    const [logs] = await db.execute(query, params);

    // Fetch product details for CREATE_PRODUCT, UPDATE_PRODUCT, UPDATE_INVENTORY, and DELETE_PRODUCT actions
    const logsWithDetails = await Promise.all(
      logs.map(async (log) => {
        let productDetails = null;
        let enhancedDetails = log.details;

        // If it's a product-related action
        if (
          (log.action === "CREATE_PRODUCT" ||
            log.action === "UPDATE_PRODUCT" ||
            log.action === "DELETE_PRODUCT" ||
            log.action === "UPDATE_INVENTORY") &&
          log.table_name === "products" &&
          log.record_id
        ) {
          // For DELETE_PRODUCT, try to get data from old_data field first
          if (log.action === "DELETE_PRODUCT" && log.old_data) {
            try {
              productDetails = JSON.parse(log.old_data);
              enhancedDetails = `Deleted product: ${productDetails.name}`;
            } catch (err) {
              console.error("Error parsing old_data:", err);
            }
          }

          // If no old_data or not a delete, fetch from products table
          if (!productDetails) {
            try {
              const [productRows] = await db.execute(
                `SELECT p.*, c.name as category_name 
                 FROM products p 
                 LEFT JOIN categories c ON p.category_id = c.id 
                 WHERE p.id = ?`,
                [log.record_id],
              );
              if (productRows.length > 0) {
                productDetails = productRows[0];

                // Enhance details text based on action
                if (log.action === "CREATE_PRODUCT") {
                  enhancedDetails = `Created product: ${productDetails.name}`;
                } else if (log.action === "UPDATE_PRODUCT") {
                  enhancedDetails = `Updated product: ${productDetails.name}`;
                } else if (log.action === "UPDATE_INVENTORY") {
                  // Try to get quantity change from stock_logs
                  const [stockLogs] = await db.execute(
                    `SELECT qty, action FROM stock_logs WHERE product_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 1`,
                    [log.record_id, log.user_id],
                  );
                  if (stockLogs.length > 0) {
                    const qtyChange = stockLogs[0].qty;
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

    return NextResponse.json({ logs: logsWithDetails });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
