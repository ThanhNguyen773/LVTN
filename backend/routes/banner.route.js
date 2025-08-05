import express from "express";
import {
  getAllBanners,
  createBanner,
  deleteBanner,
  toggleBannerActive,
  getBannersByCategory,
} from "../controllers/banner.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// 1. Route cụ thể trước
router.get("/category/:category", getBannersByCategory);

// 2. Route cơ bản
router.get("/", getAllBanners);
router.post("/", protectRoute, adminRoute, createBanner);
  
// 3. Route động (dùng :id) nên đặt sau cùng
router.patch("/:id/toggle", protectRoute, adminRoute, toggleBannerActive);
router.delete("/:id", protectRoute, adminRoute, deleteBanner);

export default router;
