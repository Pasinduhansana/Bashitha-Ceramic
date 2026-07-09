import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { PERMISSIONS, PermissionError, requirePermission } from "@/lib/permissions";


// GET - Fetch single purchase with items
export async function GET(request, { params }) {
  try {

    let user = null;

    try {
      user = await requirePermission(PERMISSIONS.MANAGE_PURCHASES);
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



    // Fetch purchase
    const purchaseResult = await db.execute({

      sql: `
        SELECT 
          p.*,
          s.name AS supplier_name,
          s.contact AS supplier_contact,
          u.name AS user_name
        FROM purchases p
        LEFT JOIN suppliers s 
          ON p.supplier_id = s.id
        LEFT JOIN users u 
          ON p.user_id = u.id
        WHERE p.id = ?
      `,

      args: [id],

    });



    if (purchaseResult.rows.length === 0) {

      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );

    }




    // Fetch purchase items
    const itemsResult = await db.execute({

      sql: `
        SELECT 
          pi.*,
          p.name AS product_name,
          p.code AS product_code
        FROM purchase_items pi
        LEFT JOIN products p 
          ON pi.product_id = p.id
        WHERE pi.purchase_id = ?
      `,

      args: [id],

    });



    return NextResponse.json({

      purchase: purchaseResult.rows[0],
      items: itemsResult.rows,

    });



  } catch (error) {

    console.error("Error fetching purchase:", error);

    return NextResponse.json(
      { error: "Failed to fetch purchase" },
      { status: 500 }
    );
  }
}




// DELETE - Delete purchase
export async function DELETE(request, { params }) {

  try {

    let user = null;


    try {

      user = await requirePermission(
        PERMISSIONS.APPROVE_PURCHASES
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




    // Get purchase items
    const itemsResult = await db.execute({

      sql: `
        SELECT 
          product_id,
          qty
        FROM purchase_items
        WHERE purchase_id = ?
      `,

      args: [id],

    });



    const items = itemsResult.rows;





    // Restore stock
    for (const item of items) {


      await db.execute({

        sql: `
          UPDATE products
          SET qty = qty - ?
          WHERE id = ?
        `,

        args: [
          item.qty,
          item.product_id
        ],

      });





      // Stock log
      await db.execute({

        sql: `
          INSERT INTO stock_logs
          (
            product_id,
            action,
            qty,
            purchase_id,
            user_id,
            created_at
          )
          VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `,

        args: [

          item.product_id,
          "PURCHASE_DELETE",
          -item.qty,
          id,
          user.id

        ],

      });


    }






    // Delete purchase items
    await db.execute({

      sql: `
        DELETE FROM purchase_items
        WHERE purchase_id = ?
      `,

      args: [id],

    });






    // Delete purchase
    await db.execute({

      sql: `
        DELETE FROM purchases
        WHERE id = ?
      `,

      args: [id],

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
        "DELETE_PURCHASE",
        "purchases",
        id

      ],

    });





    return NextResponse.json({
      success: true
    });




  } catch (error) {

    console.error("Error deleting purchase:", error);

    return NextResponse.json(
      { error: "Failed to delete purchase" },
      { status: 500 }
    );

  }
}