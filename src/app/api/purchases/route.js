import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { PERMISSIONS, PermissionError, requirePermission } from "@/lib/permissions";


// GET - Fetch all purchases
export async function GET(request) {
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


    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");


    const db = getDb();


    let query = `
      SELECT 
        p.*,
        s.name AS supplier_name,
        s.contact AS supplier_contact,
        u.name AS user_name,
        COUNT(pi.id) AS items_count
      FROM purchases p
      LEFT JOIN suppliers s 
        ON p.supplier_id = s.id
      LEFT JOIN users u 
        ON p.user_id = u.id
      LEFT JOIN purchase_items pi 
        ON p.id = pi.purchase_id
      WHERE 1=1
    `;


    const params = [];


    if (search) {

      query += `
        AND (
          s.name LIKE ?
          OR u.name LIKE ?
        )
      `;

      params.push(
        `%${search}%`,
        `%${search}%`
      );
    }


    query += `
      GROUP BY p.id
      ORDER BY p.purchase_date DESC
    `;



    const result = await db.execute({
      sql: query,
      args: params,
    });



    return NextResponse.json({
      purchases: result.rows,
    });


  } catch (error) {

    console.error("Error fetching purchases:", error);

    return NextResponse.json(
      { error: "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}



// POST - Create new purchase
export async function POST(request) {

  try {

    let user = null;


    try {

      user = await requirePermission(
        PERMISSIONS.MANAGE_PURCHASES
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



    const body = await request.json();

    const {
      supplier_id,
      items
    } = body;



    if (!supplier_id || !items || items.length === 0) {

      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );

    }



    const db = getDb();



    // Calculate total
    let total_amount = 0;

    for (const item of items) {
      total_amount += item.qty * item.cost_price;
    }




    // Insert purchase
    const purchaseResult = await db.execute({

      sql: `
        INSERT INTO purchases
        (
          supplier_id,
          user_id,
          total_amount,
          purchase_date
        )
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `,

      args: [
        supplier_id,
        user.id,
        total_amount
      ],

    });



    const purchase_id = Number(
      purchaseResult.lastInsertRowid
    );





    // Insert purchase items and update stock
    for (const item of items) {


      // Insert purchase item
      await db.execute({

        sql: `
          INSERT INTO purchase_items
          (
            purchase_id,
            product_id,
            qty,
            cost_price
          )
          VALUES (?, ?, ?, ?)
        `,

        args: [
          purchase_id,
          item.product_id,
          item.qty,
          item.cost_price
        ],

      });




      // Update stock and cost price
      await db.execute({

        sql: `
          UPDATE products
          SET 
            qty = qty + ?,
            cost_price = ?
          WHERE id = ?
        `,

        args: [
          item.qty,
          item.cost_price,
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
          "PURCHASE",
          item.qty,
          purchase_id,
          user.id
        ],

      });


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
        "CREATE_PURCHASE",
        "purchases",
        purchase_id
      ],

    });




    return NextResponse.json({
      success: true,
      purchase_id
    });



  } catch (error) {

    console.error("Error creating purchase:", error);

    return NextResponse.json(
      { error: "Failed to create purchase" },
      { status: 500 }
    );
  }
}