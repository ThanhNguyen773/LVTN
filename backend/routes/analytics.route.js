import express from "express";
import { adminRoute, protectRoute, staffRoute } from "../middleware/auth.middleware.js";
import { getAnalyticsData, getCategoryRevenueStats, getDailySalesData, getProductRevenueStats, getTopCustomers, getUserRoleStats } from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/", protectRoute, staffRoute, async (req, res) => {
	try {
		const analyticsData = await getAnalyticsData();

		const endDate = new Date();
		const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

		const dailySalesData = await getDailySalesData(startDate, endDate);

		res.json({
			analyticsData,
			dailySalesData,
		});
	} catch (error) {
		console.log("Error in analytics route", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

router.get("/user-role-stats", protectRoute, staffRoute, async (req, res) => {
  try {
    const stats = await getUserRoleStats();
    res.json(stats);
  } catch (error) {
    console.error("Error in /user-role-stats route:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
router.get("/product-revenue", protectRoute, staffRoute, getProductRevenueStats);
router.get("/top-customers", protectRoute, staffRoute, getTopCustomers);
router.get("/category-revenue", protectRoute, staffRoute, getCategoryRevenueStats);

export default router;

