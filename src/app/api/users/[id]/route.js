import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { PERMISSIONS, PermissionError, requirePermission } from "@/lib/permissions";


// GET - Fetch single user
export async function GET(request, { params }) {

  try {

    try {

      await requirePermission(
        PERMISSIONS.MANAGE_USERS
      );

    } catch (err) {

      if (err instanceof PermissionError) {

        return NextResponse.json(
          {
            success: false,
            message: err.message,
          },
          {
            status: err.status,
          }
        );

      }

      throw err;

    }



    const { id } = await params;

    const db = getDb();



    const result = await db.execute({

      sql: `
        SELECT 
          u.id,
          u.name,
          u.username,
          u.email,
          u.role_id,
          u.is_active,
          u.contact,
          u.address,
          u.created_at,
          u.updated_at,
          r.role_name
        FROM users u
        LEFT JOIN roles r
          ON u.role_id = r.id
        WHERE u.id = ?
      `,

      args: [id],

    });





    if (result.rows.length === 0) {

      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );

    }




    return NextResponse.json({

      success: true,
      user: result.rows[0],

    });



  } catch (error) {

    console.error("Error fetching user:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch user",
      },
      {
        status: 500,
      }
    );

  }

}








// PUT - Update user
export async function PUT(request, { params }) {

  try {

    let currentUser = null;



    try {

      currentUser = await requirePermission(
        PERMISSIONS.MANAGE_USERS
      );

    } catch (err) {

      if (err instanceof PermissionError) {

        return NextResponse.json(
          {
            success: false,
            message: err.message,
          },
          {
            status: err.status,
          }
        );

      }

      throw err;

    }




    const { id } = await params;

    const body = await request.json();

    const {
      name,
      username,
      email,
      role_id,
      contact,
      address
    } = body;



    const db = getDb();





    const existingUser = await db.execute({

      sql: `
        SELECT id
        FROM users
        WHERE id = ?
      `,

      args: [id],

    });





    if (existingUser.rows.length === 0) {

      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );

    }






    const duplicateUsers = await db.execute({

      sql: `
        SELECT id
        FROM users
        WHERE (email = ? OR username = ?)
        AND id != ?
      `,

      args: [
        email,
        username,
        id
      ],

    });





    if (duplicateUsers.rows.length > 0) {

      return NextResponse.json(
        {
          success: false,
          message: "Email or username already in use",
        },
        {
          status: 400,
        }
      );

    }







    await db.execute({

      sql: `
        UPDATE users
        SET
          name = ?,
          username = ?,
          email = ?,
          role_id = ?,
          contact = ?,
          address = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,

      args: [

        name,
        username,
        email,
        role_id,
        contact,
        address,
        id

      ],

    });







    if (currentUser) {

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

        args: [

          currentUser.id,
          "UPDATE_USER",
          "users",
          id

        ],

      });

    }







    return NextResponse.json({

      success: true,
      message: "User updated successfully",

    });





  } catch (error) {

    console.error("Error updating user:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user",
      },
      {
        status: 500,
      }
    );

  }

}








// DELETE - Delete user
export async function DELETE(request, { params }) {

  try {


    try {

      await requirePermission(
        PERMISSIONS.MANAGE_USERS
      );

    } catch (err) {

      if (err instanceof PermissionError) {

        return NextResponse.json(
          {
            success: false,
            message: err.message,
          },
          {
            status: err.status,
          }
        );

      }

      throw err;

    }






    const { id } = await params;

    const db = getDb();




    const existingUser = await db.execute({

      sql: `
        SELECT id
        FROM users
        WHERE id = ?
      `,

      args: [id],

    });





    if (existingUser.rows.length === 0) {

      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );

    }






    await db.execute({

      sql: `
        DELETE FROM users
        WHERE id = ?
      `,

      args: [id],

    });







    return NextResponse.json({

      success: true,
      message: "User deleted successfully",

    });





  } catch (error) {

    console.error("Error deleting user:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete user",
      },
      {
        status: 500,
      }
    );

  }

}








// PATCH - Update user status
export async function PATCH(request, { params }) {

  try {


    try {

      await requirePermission(
        PERMISSIONS.MANAGE_USERS
      );

    } catch (err) {

      if (err instanceof PermissionError) {

        return NextResponse.json(
          {
            success: false,
            message: err.message,
          },
          {
            status: err.status,
          }
        );

      }

      throw err;

    }






    const { id } = await params;

    const body = await request.json();

    const {
      is_active
    } = body;



    const db = getDb();






    const existingUser = await db.execute({

      sql: `
        SELECT id
        FROM users
        WHERE id = ?
      `,

      args: [id],

    });





    if (existingUser.rows.length === 0) {

      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );

    }







    await db.execute({

      sql: `
        UPDATE users
        SET 
          is_active = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,

      args: [
        is_active ? 1 : 0,
        id
      ],

    });







    return NextResponse.json({

      success: true,
      message: `User ${is_active ? "activated" : "deactivated"} successfully`,

    });





  } catch (error) {

    console.error("Error updating user status:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user status",
      },
      {
        status: 500,
      }
    );

  }

}