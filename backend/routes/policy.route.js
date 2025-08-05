import express from "express";
import {
  getPublicPolicies,
  getPolicyById,
  createPolicy,
  deletePolicy,
  updatePolicy,
} from "../controllers/policy.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
const router = express.Router();

router.get("/public", getPublicPolicies); // public footer
router.get("/:id", getPolicyById);
router.post("/", protectRoute, adminRoute, createPolicy);
router.delete("/:id", protectRoute, adminRoute, deletePolicy);
router.patch("/:id", protectRoute, adminRoute, updatePolicy);

export default router;