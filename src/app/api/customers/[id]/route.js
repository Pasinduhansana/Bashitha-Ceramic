import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

// GET - Fetch single customer with purchase history
export async function GET(request, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = token ? verifyToken(token) : null;


    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }


    const { id } = await params;

    const db = getDb();



    // Fetch customer
    const customerResult = await db.execute({

      sql: `
        SELECT 
          c.*,
          COUNT(DISTINCT i.id) AS invoice_count,
          COALESCE(SUM(i.net_amount), 0) AS total_purchases
        FROM customers c
        LEFT JOIN invoices i 
          ON c.id = i.customer_id
        WHERE c.id = ?
        GROUP BY c.id
      `,

      args: [
        id,
      ],

    });



    if (customerResult.rows.length === 0) {

      return NextResponse.json(
        {
          error: "Customer not found",
        },
        {
          status: 404,
        }
      );

    }



    // Fetch recent invoices
    const invoiceResult = await db.execute({

      sql: `
        SELECT *
        FROM invoices
        WHERE customer_id = ?
        ORDER BY created_at DESC
        LIMIT 10
      `,

      args: [
        id,
      ],

    });



    return NextResponse.json({

      customer: customerResult.rows[0],

      invoices: invoiceResult.rows,

    });



  } catch (error) {

    console.error(
      "Error fetching customer:",
      error
    );


    return NextResponse.json(
      {
        error: "Failed to fetch customer",
      },
      {
        status: 500,
      }
    );

  }
}




// PUT - Update customer
export async function PUT(request, { params }) {

  try {

    const cookieStore = await cookies();

    const token =
      cookieStore.get("auth_token")?.value;

    const user =
      token ? verifyToken(token) : null;



    if (!user) {

      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );

    }



    const { id } = await params;

    const body = await request.json();

    const {
      name,
      contact,
      remark,
    } = body;



    if (!name || !contact) {

      return NextResponse.json(
        {
          error: "Name and contact are required",
        },
        {
          status: 400,
        }
      );

    }



    const db = getDb();



    await db.execute({

      sql: `
        UPDATE customers
        SET 
          name = ?,
          contact = ?,
          remark = ?
        WHERE id = ?
      `,

      args: [
        name,
        contact,
        remark || null,
        id,
      ],

    });




    // Audit log
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
        user.id,
        "UPDATE_CUSTOMER",
        "customers",
        id,
      ],

    });



    return NextResponse.json({
      success: true,
    });



  } catch (error) {

    console.error(
      "Error updating customer:",
      error
    );


    return NextResponse.json(
      {
        error: "Failed to update customer",
      },
      {
        status: 500,
      }
    );

  }

}





// DELETE - Delete customer
export async function DELETE(request, { params }) {

  try {

    const cookieStore = await cookies();

    const token =
      cookieStore.get("auth_token")?.value;

    const user =
      token ? verifyToken(token) : null;



    if (!user) {

      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );

    }



    const { id } = await params;

    const db = getDb();



    // Check invoices
    const invoiceCountResult = await db.execute({

      sql: `
        SELECT COUNT(*) AS count
        FROM invoices
        WHERE customer_id = ?
      `,

      args: [
        id,
      ],

    });



    if (
      Number(invoiceCountResult.rows[0].count) > 0
    ) {

      return NextResponse.json(
        {
          error:
            "Cannot delete customer with existing invoices",
        },
        {
          status: 400,
        }
      );

    }




    // Delete customer
    await db.execute({

      sql: `
        DELETE FROM customers
        WHERE id = ?
      `,

      args: [
        id,
      ],

    });




    // Audit log
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
        user.id,
        "DELETE_CUSTOMER",
        "customers",
        id,
      ],

    });



    return NextResponse.json({
      success: true,
    });



  } catch (error) {

    console.error(
      "Error deleting customer:",
      error
    );


    return NextResponse.json(
      {
        error: "Failed to delete customer",
      },
      {
        status: 500,
      }
    );

  }

}