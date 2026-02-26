// ============================================================
// controllers/customerController.js
// ============================================================

import pool from "../config/db.js";

const getAllCustomers = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        customer_id,
        first_name,
        last_name,
        email,
        phone,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
        customer_type,
        is_active,
        created_at,
        updated_at
      FROM Customers
      WHERE is_active = 1
      ORDER BY first_name ASC, last_name ASC
    `);

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const addCustomer = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email = null,
      phone,
      address_line1 = null,
      address_line2 = null,
      city = null,
      state = null,
      postal_code = null,
      country = "Bangladesh",
      customer_type = "walk-in",
    } = req.body;

    if (!first_name || !last_name || !phone) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: first_name, last_name, and phone are required.",
      });
    }

    const validTypes = ["walk-in", "student", "staff", "wholesale"];
    if (!validTypes.includes(customer_type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid customer_type. Must be one of: ${validTypes.join(", ")}.`,
      });
    }

    const [result] = await pool.query(
      `INSERT INTO Customers
        (first_name, last_name, email, phone, address_line1, address_line2, city, state, postal_code, country, customer_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        last_name,
        email,
        phone,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
        customer_type,
      ],
    );

    const [newCustomer] = await pool.query(
      `SELECT * FROM Customers WHERE customer_id = ?`,
      [result.insertId],
    );

    return res.status(201).json({
      success: true,
      message: "Customer added successfully.",
      data: newCustomer[0],
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "A customer with this email address already exists.",
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCustomerPurchaseHistory = async (req, res) => {
  try {
    const { customer_id } = req.params;

    if (!customer_id || isNaN(customer_id)) {
      return res.status(400).json({
        success: false,
        message: "A valid customer_id is required as a URL parameter.",
      });
    }

    const [customerRows] = await pool.query(
      `SELECT customer_id, first_name, last_name, email, phone, customer_type
       FROM Customers WHERE customer_id = ? AND is_active = 1`,
      [customer_id],
    );

    if (customerRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Customer with ID ${customer_id} not found or is inactive.`,
      });
    }

    const [salesRows] = await pool.query(
      `
      SELECT
        s.sale_id,
        s.sale_reference,
        s.sale_date,
        s.total_amount,
        s.discount_amount,
        s.tax_amount,
        s.net_amount,
        s.payment_method,
        s.payment_status,
        s.notes,
        s.created_at
      FROM Sales s
      WHERE s.customer_id = ?
      ORDER BY s.sale_date DESC
    `,
      [customer_id],
    );

    const saleIds = salesRows.map((s) => s.sale_id);
    let saleItemsMap = {};

    if (saleIds.length > 0) {
      const [itemRows] = await pool.query(
        `
        SELECT
          si.sale_id,
          si.sale_item_id,
          si.product_id,
          p.product_name,
          p.sku,
          p.category,
          si.quantity,
          si.unit_price,
          si.discount,
          si.line_total
        FROM Sale_Items si
        JOIN Products p ON si.product_id = p.product_id
        WHERE si.sale_id IN (?)
        ORDER BY si.sale_item_id ASC
      `,
        [saleIds],
      );

      for (const item of itemRows) {
        if (!saleItemsMap[item.sale_id]) {
          saleItemsMap[item.sale_id] = [];
        }
        saleItemsMap[item.sale_id].push(item);
      }
    }

    const salesWithItems = salesRows.map((sale) => ({
      ...sale,
      items: saleItemsMap[sale.sale_id] || [],
    }));

    const [summaryRows] = await pool.query(
      `
      SELECT
        COUNT(sale_id)          AS total_transactions,
        COALESCE(SUM(net_amount), 0.00) AS total_amount_spent,
        COALESCE(AVG(net_amount), 0.00) AS avg_order_value,
        MAX(sale_date)          AS last_purchase_date
      FROM Sales
      WHERE customer_id = ? AND payment_status != 'refunded'
    `,
      [customer_id],
    );

    return res.status(200).json({
      success: true,
      customer: customerRows[0],
      summary: summaryRows[0],
      total_sales: salesRows.length,
      purchase_history: salesWithItems,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { getAllCustomers, addCustomer, getCustomerPurchaseHistory };
