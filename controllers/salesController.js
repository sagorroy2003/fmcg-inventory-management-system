import pool from "../config/db.js";

const createSale = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { customer_id = null, payment_method = "cash", items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "items array is required and must not be empty.",
      });
    }

    for (const [index, item] of items.entries()) {
      if (!item.product_id || !item.quantity || item.unit_price === undefined) {
        return res.status(400).json({
          success: false,
          message: `Item at index ${index} is missing product_id, quantity, or unit_price.`,
        });
      }
    }

    await connection.beginTransaction();

    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      const [productRows] = await connection.query(
        `SELECT product_id, product_name, stock_quantity FROM Products WHERE product_id = ? AND is_active = 1 FOR UPDATE`,
        [item.product_id],
      );

      if (productRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product_id} not found or is inactive.`,
        });
      }

      const product = productRows[0];

      if (product.stock_quantity < item.quantity) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.product_name}". Available: ${product.stock_quantity}, Requested: ${item.quantity}.`,
        });
      }

      const discount = item.discount ?? 0;
      const lineTotal = item.unit_price * item.quantity - discount;
      totalAmount += lineTotal;

      processedItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount,
        line_total: lineTotal,
      });
    }

    const taxRate = 0.05;
    const taxAmount = parseFloat((totalAmount * taxRate).toFixed(2));
    const netAmount = parseFloat((totalAmount + taxAmount).toFixed(2));

    const saleReference = `SALE-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const [saleResult] = await connection.query(
      `INSERT INTO Sales
        (customer_id, total_amount, discount_amount, tax_amount, net_amount, payment_method, payment_status, sale_reference)
       VALUES (?, ?, ?, ?, ?, ?, 'paid', ?)`,
      [
        customer_id,
        totalAmount.toFixed(2),
        processedItems.reduce((sum, i) => sum + i.discount, 0).toFixed(2),
        taxAmount,
        netAmount,
        payment_method,
        saleReference,
      ],
    );

    const saleId = saleResult.insertId;

    for (const item of processedItems) {
      await connection.query(
        `INSERT INTO Sale_Items (sale_id, product_id, quantity, unit_price, discount, line_total)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          saleId,
          item.product_id,
          item.quantity,
          item.unit_price,
          item.discount,
          item.line_total,
        ],
      );

      await connection.query(
        `UPDATE Products SET stock_quantity = stock_quantity - ? WHERE product_id = ?`,
        [item.quantity, item.product_id],
      );
    }

    await connection.commit();

    const [newSale] = await connection.query(
      `SELECT s.*, c.first_name, c.last_name
       FROM Sales s
       LEFT JOIN Customers c ON s.customer_id = c.customer_id
       WHERE s.sale_id = ?`,
      [saleId],
    );

    return res.status(201).json({
      success: true,
      message: "Sale created successfully.",
      data: {
        sale: newSale[0],
        items: processedItems,
      },
    });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    connection.release();
  }
};

const getAllSales = async (req, res) => {
  try {
    const [rows] = await pool.query(`
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
        s.created_at,
        s.updated_at,
        c.customer_id,
        c.first_name,
        c.last_name,
        c.phone AS customer_phone
      FROM Sales s
      LEFT JOIN Customers c ON s.customer_id = c.customer_id
      ORDER BY s.sale_date DESC
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

const getMonthlySalesReport = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        YEAR(sale_date)                         AS sale_year,
        MONTH(sale_date)                        AS sale_month,
        MONTHNAME(sale_date)                    AS month_name,
        COUNT(sale_id)                          AS total_transactions,
        SUM(total_amount)                       AS gross_sales,
        SUM(discount_amount)                    AS total_discounts,
        SUM(tax_amount)                         AS total_tax,
        SUM(net_amount)                         AS net_revenue,
        AVG(net_amount)                         AS avg_sale_value
      FROM Sales
      WHERE payment_status != 'refunded'
      GROUP BY
        YEAR(sale_date),
        MONTH(sale_date),
        MONTHNAME(sale_date)
      ORDER BY
        sale_year DESC,
        sale_month DESC
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

const getBestSellingProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.product_id,
        p.product_name,
        p.sku,
        p.category,
        p.unit_price,
        SUM(si.quantity)        AS total_quantity_sold,
        SUM(si.line_total)      AS total_revenue_generated,
        COUNT(si.sale_id)       AS number_of_sales
      FROM Sale_Items si
      JOIN Products p ON si.product_id = p.product_id
      GROUP BY
        p.product_id,
        p.product_name,
        p.sku,
        p.category,
        p.unit_price
      ORDER BY total_quantity_sold DESC
      LIMIT 5
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

export {
  createSale,
  getAllSales,
  getMonthlySalesReport,
  getBestSellingProducts,
};
