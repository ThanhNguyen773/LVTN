import express from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryBySlug,
  updateCategory,
} from "../controllers/category.controller.js";
import { protectRoute, staffRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getAllCategories);
router.get("/:slug", getCategoryBySlug);

router.post("/", protectRoute, staffRoute, createCategory);
router.put("/:id", protectRoute, staffRoute, updateCategory);
router.delete("/:id", protectRoute, staffRoute, deleteCategory);

export default router;
