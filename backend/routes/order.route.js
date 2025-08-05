import express from "express";
import {
  getAllOrders,
  // createOrder,
  getOrderById,
  deleteOrder,
  getMyOrders,
  updateOrderStatus,
  updateMultipleOrderStatus,
  cancelOrderByUser,
  getAllOrdersWithoutPagination,
  confirmOrderDelivered,

  
  
} from "../controllers/order.controller.js";
import { protectRoute, adminRoute, staffRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, staffRoute, getAllOrders); // <-- GET all orders
// router.get("/", protectRoute, adminRoute, getAllOrders); // <-- GET all orders
// router.post("/", protectRoute, createOrder);             // <-- Create order
router.get("/all", protectRoute, staffRoute, getAllOrdersWithoutPagination);
router.get("/my-orders", protectRoute, getMyOrders);
router.get("/:id", protectRoute, getOrderById);          // <-- Get one order
router.delete("/:id", protectRoute, adminRoute, deleteOrder); // <-- Delete order
router.patch("/:id/status",protectRoute, staffRoute, updateOrderStatus);
router.patch("/cancel-by-user/:id", protectRoute, cancelOrderByUser);
router.patch('/:id/confirm-delivered', protectRoute, confirmOrderDelivered);

router.patch("/bulk-status", protectRoute, staffRoute, updateMultipleOrderStatus);


export default router;
