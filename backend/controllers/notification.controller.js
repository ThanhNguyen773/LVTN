import User from "../models/user.model.js";
import mongoose from "mongoose"; 
/**
 * Lấy danh sách thông báo của người dùng hiện tại
 */
export const getMyNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("notifications");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const notifications = [...user.notifications].reverse(); // clone và đảo ngược
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};

/**
 * Đánh dấu 1 thông báo là đã đọc
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    console.log("🔍 Notification ID:", notificationId); 
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const notification = user.notifications.find(n => n._id.toString() === notificationId);

    console.log("📦 Notifications của user:", user.notifications.map(n => n._id.toString()));

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    await user.save();

    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({
      message: "Error updating notification",
      error: error.message,
    });
  }
};

/**
 * Đánh dấu tất cả thông báo là đã đọc
 */
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.notifications.forEach((n) => {
      n.isRead = true;
    });

    await user.save();
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to mark all notifications as read",
      error: error.message,
    });
  }
};



/**
 * Gửi thông báo tới 1 người dùng
 */
export const pushNotificationToUser = async (userId, message, type = "info", link = "/notifications") => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    user.notifications.push({
      _id: new mongoose.Types.ObjectId(),
      message,
      type,
      isRead: false,
      createdAt: new Date(),
      link, // 🆕 thêm link
    });

    if (user.notifications.length > 50) {
      user.notifications.shift();
    }

    await user.save();
  } catch (error) {
    console.error("Failed to push notification to user:", error.message);
  }
};


/**
 * Gửi thông báo đến tất cả người dùng (theo vai trò)
 */
export const pushNotificationToAllUsers = async (message, type = "info", link = "/notifications") => {
  try {
    const users = await User.find({ role: { $in: ["customer"] } });

    const bulkOps = users.map((user) => ({
      updateOne: {
        filter: { _id: user._id },
        update: {
          $push: {
            notifications: {
              _id: new mongoose.Types.ObjectId(),
              message,
              type,
              isRead: false,
              createdAt: new Date(),
              link, // 🆕
            },
          },
        },
      },
    }));

    if (bulkOps.length > 0) {
      await User.bulkWrite(bulkOps);
    }
  } catch (error) {
    console.error("Failed to push notification to all users:", error.message);
  }
};

/**
 * Gửi thông báo đến Admin và Nhân viên
 */
export const pushNotificationToAdminsAndStaffs = async (message, type = "info", link = "/notifications") => {
  try {
    const users = await User.find({ role: { $in: ["admin", "staff"] } });

    const bulkOps = users.map((user) => ({
      updateOne: {
        filter: { _id: user._id },
        update: {
          $push: {
            notifications: {
              _id: new mongoose.Types.ObjectId(),
              message,
              type,
              isRead: false,
              createdAt: new Date(),
              link, // 🆕
            },
          },
        },
      },
    }));

    if (bulkOps.length > 0) {
      await User.bulkWrite(bulkOps);
    }
  } catch (error) {
    console.error("❌ Error pushing notification to admins and staffs:", error.message);
  }
};


/**
 * Xoá 1 thông báo theo ID
 */
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const notification = user.notifications.find(n => n._id.toString() === notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.deleteOne();
    await user.save();

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};

/**
 * Xoá tất cả thông báo đã đọc
 */
export const deleteAllReadNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.notifications = user.notifications.filter((n) => !n.isRead);
    await user.save();

    res.status(200).json({ message: "All read notifications deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete read notifications",
      error: error.message,
    });
  }
};

/**
 * Xoá toàn bộ thông báo
 */
export const deleteAllNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.notifications = [];
    await user.save();

    res.status(200).json({ message: "All notifications deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete all notifications",
      error: error.message,
    });
  }
};
