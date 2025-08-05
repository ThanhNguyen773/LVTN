import express from "express";

import {
	createProduct,
	deleteProduct,
	getAllProducts,
	getFeaturedProducts,
	getProductById,
	getProductsByCategory,
	getRecommendedProducts,
	searchProductsByImage,
	toggleActiveProduct,
	toggleFeaturedProduct,
	updateProduct,
} from "../controllers/product.controller.js";
import { protectRoute, staffRoute } from "../middleware/auth.middleware.js";
import { uploadImage } from "../middleware/uploadImage.middleware.js";



const router = express.Router();

// ✅ Route tĩnh trước
router.get("/", getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/recommendations", getRecommendedProducts);
router.get("/category/:category", getProductsByCategory);
router.post("/search-by-image", uploadImage, searchProductsByImage);
// ✅ Route động sau cùng
router.get("/:id", getProductById);
router.post("/", protectRoute, staffRoute, createProduct);
router.patch("/:id", protectRoute, staffRoute, toggleFeaturedProduct);
router.patch("/:id/toggle-active", protectRoute, staffRoute, toggleActiveProduct);

router.delete("/:id", protectRoute, staffRoute, deleteProduct);
router.put("/:id", protectRoute, staffRoute, updateProduct);

export default router;