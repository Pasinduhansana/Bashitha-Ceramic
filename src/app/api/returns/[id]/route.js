import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { PERMISSIONS, PermissionError, requirePermission } from "@/lib/permissions";


// GET - Fetch single return
export async function GET(request, { params }) {
  try {

    let user = null;

    try {
      user = await requirePermission(PERMISSIONS.MANAGE_RETURNS);
    } catch (err) {

      if (err instanceof PermissionError) {
        return NextResponse.json(
          { error: err.message },
          { status: err.status }
        );
      }

      throw err;
    }



    const { id } = await params;

    const db = getDb();



    const result = await db.execute({

      sql: `
        SELECT 
          r.*,
          p.name AS product_name,
          i.invoice_no,
          pu.id AS purchase_no,
          c.name AS customer_name,
          s.name AS supplier_name,
          u.name AS user_name
        FROM returns r
        LEFT JOIN products p 
          ON r.product_id = p.id
        LEFT JOIN invoices i 
          ON r.invoice_id = i.id
        LEFT JOIN purchases pu 
          ON r.purchase_id = pu.id
        LEFT JOIN customers c 
          ON i.customer_id = c.id
        LEFT JOIN suppliers s 
          ON pu.supplier_id = s.id
        LEFT JOIN users u 
          ON r.user_id = u.id
        WHERE r.id = ?
      `,

      args: [id],

    });





    if (result.rows.length === 0) {

      return NextResponse.json(
        { error: "Return not found" },
        { status: 404 }
      );

    }




    return NextResponse.json({
      return: result.rows[0],
    });



  } catch (error) {

    console.error("Error fetching return:", error);

    return NextResponse.json(
      { error: "Failed to fetch return" },
      { status: 500 }
    );

  }
}





// PATCH - Approve or reject return
export async function PATCH(request, { params }) {

  try {

    let user = null;


    try {

      user = await requirePermission(
        PERMISSIONS.APPROVE_RETURNS
      );

    } catch (err) {

      if (err instanceof PermissionError) {

        return NextResponse.json(
          { error: err.message },
          { status: err.status }
        );

      }

      throw err;

    }




    const { id } = await params;

    const body = await request.json();

    const {
      status
    } = body;




    if (
      !status ||
      !["approved", "rejected"].includes(status)
    ) {

      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );

    }




    const db = getDb();





    // Get return details
    const returnResult = await db.execute({

      sql: `
        SELECT *
        FROM returns
        WHERE id = ?
      `,

      args: [id],

    });





    if (returnResult.rows.length === 0) {

      return NextResponse.json(
        { error: "Return not found" },
        { status: 404 }
      );

    }





    const returnData = returnResult.rows[0];






    // Update return status
    await db.execute({

      sql: `
        UPDATE returns
        SET status = ?
        WHERE id = ?
      `,

      args: [
        status,
        id
      ],

    });







    // Update stock if approved
    if (status === "approved") {


      if (returnData.invoice_id) {


        // Invoice return - increase stock
        await db.execute({

          sql: `
            UPDATE products
            SET qty = qty + ?
            WHERE id = ?
          `,

          args: [
            returnData.qty,
            returnData.product_id
          ],

        });





        await db.execute({

          sql: `
            INSERT INTO stock_logs
            (
              product_id,
              action,
              qty,
              return_id,
              user_id,
              created_at
            )
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `,

          args: [

            returnData.product_id,
            "RETURN_INVOICE",
            returnData.qty,
            id,
            user.id

          ],

        });





      } else if (returnData.purchase_id) {



        // Purchase return - decrease stock
        await db.execute({

          sql: `
            UPDATE products
            SET qty = qty - ?
            WHERE id = ?
          `,

          args: [
            returnData.qty,
            returnData.product_id
          ],

        });





        await db.execute({

          sql: `
            INSERT INTO stock_logs
            (
              product_id,
              action,
              qty,
              return_id,
              user_id,
              created_at
            )
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `,

          args: [

            returnData.product_id,
            "RETURN_PURCHASE",
            -returnData.qty,
            id,
            user.id

          ],

        });


      }

    }







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
        "APPROVE_RETURN",
        "returns",
        id

      ],

    });







    return NextResponse.json({
      success: true,
    });





  } catch (error) {

    console.error("Error updating return:", error);

    return NextResponse.json(
      { error: "Failed to update return" },
      { status: 500 }
    );

  }
}






// DELETE - Delete return
export async function DELETE(request, { params }) {

  try {

    let user = null;


    try {

      user = await requirePermission(
        PERMISSIONS.MANAGE_RETURNS
      );

    } catch (err) {

      if (err instanceof PermissionError) {

        return NextResponse.json(
          { error: err.message },
          { status: err.status }
        );

      }

      throw err;

    }





    const { id } = await params;

    const db = getDb();





    await db.execute({

      sql: `
        DELETE FROM returns
        WHERE id = ?
      `,

      args: [id],

    });







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
        "DELETE_RETURN",
        "returns",
        id

      ],

    });







    return NextResponse.json({
      success: true,
    });





  } catch (error) {

    console.error("Error deleting return:", error);

    return NextResponse.json(
      { error: "Failed to delete return" },
      { status: 500 }
    );

  }
}