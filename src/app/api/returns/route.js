import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { PERMISSIONS, PermissionError, requirePermission } from "@/lib/permissions";


// GET - Fetch all returns
export async function GET(request) {
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



    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const search = searchParams.get("search");


    const db = getDb();



    let query = `
      SELECT 
        r.*,
        p.name AS product_name,
        p.code AS product_code,
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
      WHERE 1=1
    `;



    const params = [];



    if (status && status !== "all") {

      query += `
        AND r.status = ?
      `;

      params.push(status);

    }



    if (search) {

      query += `
        AND (
          p.name LIKE ?
          OR i.invoice_no LIKE ?
        )
      `;

      params.push(
        `%${search}%`,
        `%${search}%`
      );

    }



    query += `
      ORDER BY r.created_at DESC
    `;




    const result = await db.execute({

      sql: query,
      args: params,

    });



    const returnsWithType = result.rows.map((ret) => ({
      ...ret,
      type: ret.invoice_id ? "invoice" : "purchase",
    }));



    return NextResponse.json({
      returns: returnsWithType,
    });



  } catch (error) {

    console.error("Error fetching returns:", error);

    return NextResponse.json(
      { error: "Failed to fetch returns" },
      { status: 500 }
    );

  }
}





// POST - Create new return
export async function POST(request) {

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




    const body = await request.json();


    const {
      invoice_id,
      purchase_id,
      product_id,
      qty,
      reason
    } = body;




    if (!product_id || !qty || !reason) {

      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );

    }




    if (!invoice_id && !purchase_id) {

      return NextResponse.json(
        {
          error: "Either invoice_id or purchase_id is required"
        },
        {
          status: 400
        }
      );

    }





    const db = getDb();





    const result = await db.execute({

      sql: `
        INSERT INTO returns
        (
          invoice_id,
          purchase_id,
          product_id,
          qty,
          reason,
          status,
          user_id,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `,

      args: [

        invoice_id || null,
        purchase_id || null,
        product_id,
        qty,
        reason,
        "pending",
        user.id

      ],

    });





    const return_id = Number(
      result.lastInsertRowid
    );






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
        "CREATE_RETURN",
        "returns",
        return_id

      ],

    });






    return NextResponse.json({

      success: true,
      return_id

    });





  } catch (error) {

    console.error("Error creating return:", error);

    return NextResponse.json(
      { error: "Failed to create return" },
      { status: 500 }
    );

  }
}