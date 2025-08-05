import express from "express";
import {
  createCoupon,
  deleteAllCoupons,
  deleteCoupon,
  getAllActiveCouponsOfUser,
  getAllCoupons,
  getCoupon,
  getUserCoupon,
  reactivateCoupon,
  updateCoupon,
  validateCoupon
} from "../controllers/coupon.controller.js";
import { protectRoute, staffRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// ----- User Routes -----
router.get("/user/actives", protectRoute, getAllActiveCouponsOfUser);
router.get("/user/active", protectRoute, getCoupon);
router.get("/user", protectRoute, getUserCoupon);
router.post("/validate", protectRoute, validateCoupon);
router.patch("/reactivate", protectRoute, reactivateCoupon);

// ----- Admin/Staff Routes -----
router.get("/", protectRoute, getAllCoupons);
router.post("/", protectRoute, createCoupon);
router.put("/:id", protectRoute, updateCoupon);
router.delete("/:id", protectRoute, staffRoute, deleteCoupon);
router.delete("/all", protectRoute, staffRoute, deleteAllCoupons);

export default router;
