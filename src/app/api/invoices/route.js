import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { PERMISSIONS, PermissionError, requirePermission } from "@/lib/permissions";

// GET - Fetch all invoices with customer info
export async function GET(request) {
  try {
    let user = null;

    try {
      user = await requirePermission(PERMISSIONS.CREATE_INVOICES);
    } catch (err) {
      if (err instanceof PermissionError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const db = getDb();

    let query = `
      SELECT 
        i.*,
        c.name AS customer_name,
        c.contact AS customer_contact,
        u.name AS user_name
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN users u ON i.user_id = u.id
      WHERE 1=1
    `;

    const params = [];

    if (status && status !== "all") {
      query += ` AND i.status = ?`;
      params.push(status);
    }

    if (search) {
      query += ` AND (i.invoice_no LIKE ? OR c.name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY i.created_at DESC`;

    const result = await db.execute({
      sql: query,
      args: params,
    });

    return NextResponse.json({
      invoices: result.rows,
    });

  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}


// POST - Create new invoice
export async function POST(request) {
  try {
    let user = null;

    try {
      user = await requirePermission(PERMISSIONS.CREATE_INVOICES);
    } catch (err) {
      if (err instanceof PermissionError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }

    const body = await request.json();

    const {
      customer,
      items,
      discount,
      payment_method
    } = body;


    if (!customer || !customer.contact || !customer.name || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }


    const db = getDb();

    let customer_id;


    // Existing customer
    if (customer.existing_id) {
      customer_id = customer.existing_id;

    } else {

      // Create customer
      const customerResult = await db.execute({
        sql: `
          INSERT INTO customers 
          (name, contact, remark, created_at)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `,
        args: [
          customer.name,
          customer.contact,
          customer.remark || null
        ]
      });


      customer_id = Number(customerResult.lastInsertRowid);


      // Audit log
      await db.execute({
        sql: `
          INSERT INTO audit_logs
          (user_id, action, table_name, record_id, timestamp)
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `,
        args: [
          user.id,
          "CREATE_CUSTOMER",
          "customers",
          customer_id
        ]
      });
    }



    // Calculate totals
    let total_amount = 0;

    for (const item of items) {
      total_amount += item.qty * item.selling_price;
    }

    const net_amount = total_amount - (discount || 0);



    // Generate invoice number
    const maxResult = await db.execute({
      sql: `
        SELECT MAX(id) AS max_id 
        FROM invoices
      `,
      args: []
    });


    const maxId = maxResult.rows[0]?.max_id || 0;

    const invoice_no =
      `INV-${new Date().getFullYear()}-${String(Number(maxId) + 1).padStart(3, "0")}`;



    // Insert invoice
    const invoiceResult = await db.execute({
      sql: `
        INSERT INTO invoices
        (
          invoice_no,
          customer_id,
          user_id,
          total_amount,
          discount,
          net_amount,
          payment_method,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `,
      args: [
        invoice_no,
        customer_id,
        user.id,
        total_amount,
        discount || 0,
        net_amount,
        payment_method
      ]
    });


    const invoice_id = Number(invoiceResult.lastInsertRowid);



    // Insert invoice items + stock updates
    for (const item of items) {

      const line_total = item.qty * item.selling_price;


      // Invoice item
      await db.execute({
        sql: `
          INSERT INTO invoice_items
          (
            invoice_id,
            product_id,
            qty,
            selling_price,
            line_total
          )
          VALUES (?, ?, ?, ?, ?)
        `,
        args: [
          invoice_id,
          item.product_id,
          item.qty,
          item.selling_price,
          line_total
        ]
      });



      // Update stock
      await db.execute({
        sql: `
          UPDATE products
          SET qty = qty - ?
          WHERE id = ?
        `,
        args: [
          item.qty,
          item.product_id
        ]
      });



      // Stock log
      await db.execute({
        sql: `
          INSERT INTO stock_logs
          (
            product_id,
            action,
            qty,
            invoice_id,
            user_id,
            created_at
          )
          VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `,
        args: [
          item.product_id,
          "SALE",
          -item.qty,
          invoice_id,
          user.id
        ]
      });

    }



    // Invoice audit log
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
        "CREATE_INVOICE",
        "invoices",
        invoice_id
      ]
    });



    return NextResponse.json({
      success: true,
      invoice_id,
      invoice_no
    });


  } catch (error) {
    console.error("Error creating invoice:", error);

    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}