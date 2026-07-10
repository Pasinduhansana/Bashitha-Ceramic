import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const PERMISSIONS = {
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

const PERMISSION_DEFINITIONS = {
  [PERMISSIONS.MANAGE_USERS]: "Manage users (CRUD, activation)",
  [PERMISSIONS.CONFIGURE_ROLES]: "Configure roles and permissions",
  [PERMISSIONS.VIEW_PRODUCTS]: "View product catalog and details",
  [PERMISSIONS.EDIT_PRODUCTS]: "Add and edit products",
  [PERMISSIONS.DELETE_PRODUCTS]: "Delete products",
  [PERMISSIONS.MANAGE_PURCHASES]: "Create and manage purchases",
  [PERMISSIONS.CREATE_INVOICES]: "Create and manage invoices",
  [PERMISSIONS.MANAGE_RETURNS]: "Create and manage returns",
  [PERMISSIONS.VIEW_STOCK_LOGS]: "View stock movement logs",
  [PERMISSIONS.UPDATE_STOCK]: "Manually adjust stock",
  [PERMISSIONS.ACCESS_REPORTS]: "Access reporting views",
  [PERMISSIONS.APPROVE_PURCHASES]: "Approve or delete purchases",
  [PERMISSIONS.APPROVE_RETURNS]: "Approve or reject returns",
  [PERMISSIONS.VIEW_AUDIT_LOGS]: "View system audit logs",
};

const ROLES = [
  {
    name: "System Admin",
    description: "Full system administrator access",
  },
  {
    name: "Owner",
    description: "Business owner with high-level control",
  },
  {
    name: "Sales Assistant",
    description: "Sales operations and basic inventory",
  },
  {
    name: "Staff",
    description: "Basic staff with limited inventory access",
  },
];

const ROLE_PERMISSION_MATRIX = {
  "System Admin": Object.values(PERMISSIONS),

  Owner: [
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.EDIT_PRODUCTS,
    PERMISSIONS.DELETE_PRODUCTS,
    PERMISSIONS.MANAGE_PURCHASES,
    PERMISSIONS.CREATE_INVOICES,
    PERMISSIONS.MANAGE_RETURNS,
    PERMISSIONS.VIEW_STOCK_LOGS,
    PERMISSIONS.UPDATE_STOCK,
    PERMISSIONS.ACCESS_REPORTS,
    PERMISSIONS.APPROVE_PURCHASES,
    PERMISSIONS.APPROVE_RETURNS,
  ],

  "Sales Assistant": [
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.EDIT_PRODUCTS,
    PERMISSIONS.MANAGE_PURCHASES,
    PERMISSIONS.CREATE_INVOICES,
    PERMISSIONS.MANAGE_RETURNS,
    PERMISSIONS.VIEW_STOCK_LOGS,
    PERMISSIONS.UPDATE_STOCK,
  ],

  Staff: [PERMISSIONS.VIEW_PRODUCTS, PERMISSIONS.EDIT_PRODUCTS, PERMISSIONS.VIEW_STOCK_LOGS, PERMISSIONS.UPDATE_STOCK],
};

async function seed() {
  console.log("Starting permission seed...");

  // Create tables if not exists

  await db.execute(`
    CREATE TABLE IF NOT EXISTS permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      permission_key TEXT UNIQUE NOT NULL,
      description TEXT
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role_name TEXT UNIQUE NOT NULL,
      description TEXT
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS role_permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role_id INTEGER NOT NULL,
      permission_id INTEGER NOT NULL,
      UNIQUE(role_id, permission_id)
    )
  `);

  console.log("Tables checked");

  // Insert permissions

  const permissionIds = {};

  for (const [key, description] of Object.entries(PERMISSION_DEFINITIONS)) {
    const existing = await db.execute({
      sql: `
        SELECT id
        FROM permissions
        WHERE permission_key = ?
      `,
      args: [key],
    });

    if (existing.rows.length > 0) {
      permissionIds[key] = existing.rows[0].id;
    } else {
      const result = await db.execute({
        sql: `
          INSERT INTO permissions
          (
            permission_key,
            description
          )
          VALUES (?,?)
        `,
        args: [key, description],
      });

      permissionIds[key] = Number(result.lastInsertRowid);
    }
  }

  console.log("Permissions seeded");

  // Insert roles

  const roleIds = {};

  for (const role of ROLES) {
    const existing = await db.execute({
      sql: `
        SELECT id
        FROM roles
        WHERE role_name = ?
      `,
      args: [role.name],
    });

    if (existing.rows.length > 0) {
      roleIds[role.name] = existing.rows[0].id;
    } else {
      const result = await db.execute({
        sql: `
          INSERT INTO roles
          (
            role_name,
            description
          )
          VALUES (?,?)
        `,

        args: [role.name, role.description],
      });

      roleIds[role.name] = Number(result.lastInsertRowid);
    }
  }

  console.log("Roles seeded");

  // Assign permissions

  for (const [roleName, permissions] of Object.entries(ROLE_PERMISSION_MATRIX)) {
    const roleId = roleIds[roleName];

    for (const permission of permissions) {
      const permissionId = permissionIds[permission];

      const exists = await db.execute({
        sql: `
          SELECT id
          FROM role_permissions
          WHERE role_id = ?
          AND permission_id = ?
        `,

        args: [roleId, permissionId],
      });

      if (exists.rows.length === 0) {
        await db.execute({
          sql: `
            INSERT INTO role_permissions
            (
              role_id,
              permission_id
            )
            VALUES (?,?)
          `,

          args: [roleId, permissionId],
        });
      }
    }
  }

  console.log("Role permissions seeded");

  console.log("✅ Permission seed completed successfully");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
