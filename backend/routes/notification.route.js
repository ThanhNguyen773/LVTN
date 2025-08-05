import express from "express";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllReadNotifications,
  deleteAllNotifications,
} from "../controllers/notification.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// ✅ Lấy danh sách thông báo của user
router.get("/", protectRoute, getMyNotifications);

// ✅ Đánh dấu tất cả thông báo là đã đọc (phải đặt trước route có param)
router.patch("/read-all", protectRoute, markAllNotificationsAsRead);

// ✅ Xoá tất cả thông báo đã đọc
router.delete("/delete/all-read", protectRoute, deleteAllReadNotifications);

// ✅ Xoá toàn bộ thông báo
router.delete("/delete/all", protectRoute, deleteAllNotifications);

// ✅ Đánh dấu một thông báo là đã đọc
router.patch("/:notificationId/read", protectRoute, markNotificationAsRead);

// ✅ Xoá một thông báo theo ID
router.delete("/:notificationId", protectRoute, deleteNotification);

export default router;
