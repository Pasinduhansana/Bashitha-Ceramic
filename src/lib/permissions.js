import { getDb } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { getPermissionCache, setPermissionCache } from "@/lib/permissionCache";

// Permission keys
export const PERMISSIONS = {
  MANAGE_USERS: "manage_users",
  CONFIGURE_ROLES: "configure_roles",
  VIEW_PRODUCTS: "view_products",
  EDIT_PRODUCTS: "edit_products",
  DELETE_PRODUCTS: "delete_products",
  MANAGE_PURCHASES: "manage_purchases",
  CREATE_INVOICES: "create_invoices",
  MANAGE_RETURNS: "manage_returns",
  VIEW_STOCK_LOGS: "view_stock_logs",
  UPDATE_STOCK: "update_stock",
  ACCESS_REPORTS: "access_reports",
  APPROVE_PURCHASES: "approve_purchases",
  APPROVE_RETURNS: "approve_returns",
  VIEW_AUDIT_LOGS: "view_audit_logs",
};

export class PermissionError extends Error {
  constructor(message, status = 403) {
    super(message);

    this.name = "PermissionError";

    this.status = status;
  }
}

export async function getUserPermissions(userId, roleId) {

  if (!userId || !roleId) {
    console.log("User ID or Role ID is missing. Returning empty permissions.");
    return [];
  }
  const start = Date.now();

  console.log("---- PERMISSION CHECK START ----");

  const cached = getPermissionCache(userId);

  console.log("1. Permission cache check:", Date.now() - start, "ms", cached ? "HIT" : "MISS");

  if (cached) {
    console.log("2. Returning cached permissions:", Date.now() - start, "ms");

    console.log("---- PERMISSION CHECK END ----");

    return cached;
  }

  const dbStart = Date.now();

  console.log("Permission Query Params:", {
  userId,
  roleId,
  userIdType: typeof userId,
  roleIdType: typeof roleId,
});

  const db = getDb();

  console.log("3. DB client created:", Date.now() - dbStart, "ms");

  const queryStart = Date.now();

  const result = await db.execute({
    sql: `

      SELECT 
        p.permission_key

      FROM role_permissions rp

      INNER JOIN permissions p
        ON rp.permission_id = p.id

      WHERE rp.role_id = ?


      UNION


      SELECT 
        p.permission_key

      FROM user_permissions up

      INNER JOIN permissions p
        ON up.permission_id = p.id

      WHERE up.user_id = ?
      AND up.is_allowed = 1

    `,

    args: [roleId, userId],
  });

  console.log("4. Permission SQL execution:", Date.now() - queryStart, "ms");

  const mapStart = Date.now();

  const permissions = result.rows.map((r) => r.permission_key);

  console.log("5. Permission mapping:", Date.now() - mapStart, "ms");

  const cacheStart = Date.now();

  setPermissionCache(userId, permissions);

  console.log("6. Permission cache store:", Date.now() - cacheStart, "ms");

  console.log("7. Total permission time:", Date.now() - start, "ms");

  console.log("---- PERMISSION CHECK END ----");

  return permissions;
}

export async function requirePermission(permissionKey) {
  const cookieStore = await cookies();

  const token = cookieStore.get("auth_token")?.value || cookieStore.get("token")?.value;

  if (!token) {
    throw new PermissionError("Unauthorized", 401);
  }

  const payload = verifyToken(token);

  if (!payload) {
    throw new PermissionError("Unauthorized", 401);
  }

  const allowed = payload.permissions?.includes(permissionKey);

  if (!allowed) {
    throw new PermissionError("Forbidden", 403);
  }

  return payload;
}

export async function getPermissionsForUser(userId, roleId) {
  const db = getDb();

  const result = await db.execute({
    sql: `

      SELECT p.permission_key
      FROM role_permissions rp
      JOIN permissions p
      ON rp.permission_id = p.id
      WHERE rp.role_id = ?

      UNION

      SELECT p.permission_key
      FROM user_permissions up
      JOIN permissions p
      ON up.permission_id = p.id
      WHERE up.user_id = ?
      AND up.is_allowed = 1
    `,

    args: [roleId, userId],
  });

  return result.rows.map((row) => row.permission_key);
}
