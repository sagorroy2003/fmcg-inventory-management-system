// ============================================================
// controllers/supplierController.js
// ============================================================

import pool from "../config/db.js";

const getAllSuppliers = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        supplier_id,
        supplier_name,
        contact_person,
        email,
        phone,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
        is_active,
        created_at,
        updated_at
      FROM Suppliers
      WHERE is_active = 1
      ORDER BY supplier_name ASC
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

const addSupplier = async (req, res) => {
  try {
    const {
      supplier_name,
      contact_person,
      email,
      phone,
      address_line1,
      address_line2 = null,
      city,
      state,
      postal_code,
      country = "Bangladesh",
    } = req.body;

    if (
      !supplier_name ||
      !contact_person ||
      !email ||
      !phone ||
      !address_line1 ||
      !city ||
      !state ||
      !postal_code
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: supplier_name, contact_person, email, phone, address_line1, city, state, and postal_code are required.",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO Suppliers
        (supplier_name, contact_person, email, phone, address_line1, address_line2, city, state, postal_code, country)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        supplier_name,
        contact_person,
        email,
        phone,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
      ],
    );

    const [newSupplier] = await pool.query(
      `SELECT * FROM Suppliers WHERE supplier_id = ?`,
      [result.insertId],
    );

    return res.status(201).json({
      success: true,
      message: "Supplier added successfully.",
      data: newSupplier[0],
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "A supplier with this email address already exists.",
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSupplierPerformance = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        s.supplier_id,
        s.supplier_name,
        s.contact_person,
        s.email,
        s.phone,
        COUNT(DISTINCT p.product_id)          AS total_products_supplied,
        COALESCE(SUM(si.quantity), 0)          AS total_units_sold,
        COALESCE(SUM(si.line_total), 0.00)     AS total_revenue_generated,
        COALESCE(AVG(si.line_total), 0.00)     AS avg_sale_line_value,
        COUNT(DISTINCT si.sale_id)             AS total_sales_involved
      FROM Suppliers s
      LEFT JOIN Products p
        ON s.supplier_id = p.supplier_id
      LEFT JOIN Sale_Items si
        ON p.product_id = si.product_id
      WHERE s.is_active = 1
      GROUP BY
        s.supplier_id,
        s.supplier_name,
        s.contact_person,
        s.email,
        s.phone
      ORDER BY total_revenue_generated DESC
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

export { getAllSuppliers, addSupplier, getSupplierPerformance };
