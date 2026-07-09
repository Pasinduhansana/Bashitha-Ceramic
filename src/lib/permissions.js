import { getDb } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";


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






const ROLE_DEFINITIONS = [

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
    PERMISSIONS.DELETE_PRODUCTS,
    PERMISSIONS.MANAGE_PURCHASES,
    PERMISSIONS.CREATE_INVOICES,
    PERMISSIONS.MANAGE_RETURNS,
    PERMISSIONS.VIEW_STOCK_LOGS,
    PERMISSIONS.UPDATE_STOCK,
    PERMISSIONS.ACCESS_REPORTS,

  ],



  Staff: [

    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.EDIT_PRODUCTS,
    PERMISSIONS.MANAGE_PURCHASES,
    PERMISSIONS.VIEW_STOCK_LOGS,
    PERMISSIONS.UPDATE_STOCK,

  ],

};







export class PermissionError extends Error {

  constructor(message, status = 403) {

    super(message);

    this.name = "PermissionError";

    this.status = status;

  }

}









async function ensurePermissionTables(db) {


  await db.execute({

    sql: `
      CREATE TABLE IF NOT EXISTS permissions (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        permission_key TEXT UNIQUE,

        description TEXT

      )
    `,

    args: [],

  });





  await db.execute({

    sql: `
      CREATE TABLE IF NOT EXISTS role_permissions (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        role_id INTEGER,

        permission_id INTEGER

      )
    `,

    args: [],

  });





  await db.execute({

    sql: `
      CREATE TABLE IF NOT EXISTS user_permissions (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        user_id INTEGER,

        permission_id INTEGER,

        is_allowed INTEGER

      )
    `,

    args: [],

  });


}









export async function ensurePermissionsSeed() {


  const db = getDb();


  await ensurePermissionTables(db);




  const permissionIds = {};



  for (const [key, description] of Object.entries(PERMISSION_DEFINITIONS)) {


    const existing = await db.execute({

      sql: `
        SELECT id
        FROM permissions
        WHERE permission_key = ?
        LIMIT 1
      `,

      args: [key],

    });




    if (existing.rows.length === 0) {


      const result = await db.execute({

        sql: `
          INSERT INTO permissions
          (
            permission_key,
            description
          )
          VALUES (?,?)
        `,

        args: [
          key,
          description,
        ],

      });


      permissionIds[key] = Number(result.lastInsertRowid);



    } else {


      permissionIds[key] = existing.rows[0].id;


    }


  }








  const roleIds = {};



  for (const role of ROLE_DEFINITIONS) {


    const existing = await db.execute({

      sql: `
        SELECT id
        FROM roles
        WHERE role_name = ?
        LIMIT 1
      `,

      args: [
        role.name
      ],

    });





    if (existing.rows.length === 0) {


      const result = await db.execute({

        sql: `
          INSERT INTO roles
          (
            role_name,
            description
          )
          VALUES (?,?)
        `,

        args: [
          role.name,
          role.description,
        ],

      });


      roleIds[role.name] = Number(
        result.lastInsertRowid
      );



    } else {


      roleIds[role.name] = existing.rows[0].id;


    }


  }









  for (const [roleName, permissions] of Object.entries(ROLE_PERMISSION_MATRIX)) {


    const roleId = roleIds[roleName];

    if (!roleId) continue;



    for (const permKey of permissions) {


      const permissionId = permissionIds[permKey];

      if (!permissionId) continue;




      const existing = await db.execute({

        sql: `
          SELECT id
          FROM role_permissions
          WHERE role_id = ?
          AND permission_id = ?
          LIMIT 1
        `,

        args: [
          roleId,
          permissionId,
        ],

      });





      if (existing.rows.length === 0) {


        await db.execute({

          sql: `
            INSERT INTO role_permissions
            (
              role_id,
              permission_id
            )
            VALUES (?,?)
          `,

          args: [
            roleId,
            permissionId,
          ],

        });


      }


    }


  }


}









export async function userHasPermission(
  userId,
  roleId,
  permissionKey
) {


  const db = getDb();



  const override = await db.execute({

    sql: `
      SELECT up.is_allowed

      FROM user_permissions up

      JOIN permissions p
      ON up.permission_id = p.id

      WHERE up.user_id = ?
      AND p.permission_key = ?

      LIMIT 1
    `,

    args: [
      userId,
      permissionKey,
    ],

  });





  if (override.rows.length > 0) {

    return Boolean(
      override.rows[0].is_allowed
    );

  }







  const rolePermission = await db.execute({

    sql: `
      SELECT 1

      FROM role_permissions rp

      JOIN permissions p
      ON rp.permission_id = p.id

      WHERE rp.role_id = ?
      AND p.permission_key = ?

      LIMIT 1
    `,

    args: [
      roleId,
      permissionKey,
    ],

  });





  return rolePermission.rows.length > 0;


}









export async function requirePermission(permissionKey) {


  const cookieStore = await cookies();


  const token =
    cookieStore.get("auth_token")?.value ||
    cookieStore.get("token")?.value;





  if (!token) {

    throw new PermissionError(
      "Unauthorized",
      401
    );

  }





  const payload = verifyToken(token);



  if (!payload) {

    throw new PermissionError(
      "Unauthorized",
      401
    );

  }





  await ensurePermissionsSeed();





  const allowed = await userHasPermission(

    payload.id,

    payload.roleId,

    permissionKey

  );





  if (!allowed) {


    throw new PermissionError(
      "Forbidden",
      403
    );


  }






  return payload;


}