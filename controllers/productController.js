import pool from "../config/db.js";

const getAllProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.product_id,
        p.product_name,
        p.sku,
        p.category,
        p.unit,
        p.unit_price,
        p.cost_price,
        p.stock_quantity,
        p.reorder_level,
        p.expiry_date,
        p.is_active,
        p.created_at,
        p.updated_at,
        s.supplier_id,
        s.supplier_name
      FROM Products p
      LEFT JOIN Suppliers s ON p.supplier_id = s.supplier_id
      ORDER BY p.product_id ASC
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

const addProduct = async (req, res) => {
  try {
    const {
      supplier_id,
      product_name,
      sku,
      category,
      unit,
      unit_price,
      cost_price,
      stock_quantity,
      reorder_level,
      expiry_date = null,
    } = req.body;

    if (
      !product_name ||
      !sku ||
      !category ||
      !unit ||
      unit_price === undefined ||
      cost_price === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: product_name, sku, category, unit, unit_price, cost_price are required.",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO Products
        (supplier_id, product_name, sku, category, unit, unit_price, cost_price, stock_quantity, reorder_level, expiry_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        supplier_id || null,
        product_name,
        sku,
        category,
        unit,
        unit_price,
        cost_price,
        stock_quantity ?? 0,
        reorder_level ?? 10,
        expiry_date,
      ],
    );

    const [newProduct] = await pool.query(
      `SELECT
         p.product_id,
         p.product_name,
         p.sku,
         p.category,
         p.unit,
         p.unit_price,
         p.cost_price,
         p.stock_quantity,
         p.reorder_level,
         p.expiry_date,
         p.is_active,
         p.created_at,
         p.updated_at,
         s.supplier_id,
         s.supplier_name
       FROM Products p
       LEFT JOIN Suppliers s ON p.supplier_id = s.supplier_id
       WHERE p.product_id = ?`,
      [result.insertId],
    );

    return res.status(201).json({
      success: true,
      message: "Product added successfully.",
      data: newProduct[0],
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: `Duplicate entry: A product with this SKU already exists.`,
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getLowStockProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.product_id,
        p.product_name,
        p.sku,
        p.category,
        p.unit,
        p.unit_price,
        p.cost_price,
        p.stock_quantity,
        p.reorder_level,
        p.expiry_date,
        p.is_active,
        p.created_at,
        p.updated_at,
        s.supplier_id,
        s.supplier_name
      FROM Products p
      LEFT JOIN Suppliers s ON p.supplier_id = s.supplier_id
      WHERE p.stock_quantity <= p.reorder_level
        AND p.is_active = 1
      ORDER BY p.stock_quantity ASC
    `);

    return res.status(200).json({
      success: true,
      count: rows.length,
      message:
        rows.length > 0
          ? `${rows.length} product(s) are at or below reorder level.`
          : "All products are sufficiently stocked.",
      data: rows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Query the SQL View directly
const getLowStockAlertsView = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM View_LowStockAlerts");
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

// Trigger the SQL Stored Procedure
const restockProduct = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity) {
      return res
        .status(400)
        .json({
          success: false,
          message: "product_id and quantity are required.",
        });
    }

    // This calls the exact Procedure you wrote in MySQL Workbench
    await pool.query("CALL ProcessRestock(?, ?)", [product_id, quantity]);

    return res.status(200).json({
      success: true,
      message: `Successfully restocked product ${product_id} by ${quantity} units using Stored Procedure.`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { getAllProducts, addProduct, getLowStockProducts, getLowStockAlertsView, restockProduct };
