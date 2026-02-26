// routes/salesRoutes.js
import express from "express";
import {
  createSale,
  getAllSales,
  getMonthlySalesReport,
  getBestSellingProducts,
} from "../controllers/salesController.js";

const router = express.Router();

// Main sales routes
router.route("/").get(getAllSales).post(createSale);

// Analytics & Report routes
router.get("/reports/monthly", getMonthlySalesReport);
router.get("/reports/best-sellers", getBestSellingProducts);

export default router;
