import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import notificationSoundSrc from "../assets/sounds/notification.mp3";

const notificationSound = new Audio(notificationSoundSrc);

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  loading: false,

  // Fetch current user's notifications
  fetchNotifications: async () => {
    try {
      set({ loading: true });

      const res = await axios.get("/notifications");
      const newNotifications = res.data;

      const oldNotifications = get().notifications || [];
      const oldIds = new Set(oldNotifications.map((n) => n._id));

      // Kiểm tra có thông báo chưa có trước đó và chưa đọc không
      const newUnread = newNotifications.filter(
        (n) => !oldIds.has(n._id) && !n.isRead
      );

      if (newUnread.length > 0) {
        try {
          notificationSound.play();
        } catch (error) {
          console.warn("Không thể phát âm thanh:", error);
        }
      }

      set({ notifications: newNotifications, loading: false });
    } catch (err) {
      set({ loading: false });
      toast.error("Failed to fetch notifications");
    }
  },

  // Mark single notification as read
  markAsRead: async (notificationId) => {
    try {
      await axios.patch(`/notifications/${notificationId}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        ),
      }));
    } catch (err) {
      toast.error("Failed to mark as read");
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      await axios.patch("/notifications/read-all");
      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          isRead: true,
        })),
      }));
    } catch (err) {
      toast.error("Failed to mark all as read");
    }
  },

  // Delete single notification
  deleteNotification: async (notificationId) => {
    try {
      await axios.delete(`/notifications/${notificationId}`);
      set((state) => ({
        notifications: state.notifications.filter(
          (n) => n._id !== notificationId
        ),
      }));
    } catch (err) {
      toast.error("Failed to delete notification");
    }
  },

  // Delete all read notifications
  deleteAllRead: async () => {
    try {
      await axios.delete("/notifications/delete/all-read");
      set((state) => ({
        notifications: state.notifications.filter((n) => !n.read),
      }));
    } catch (err) {
      toast.error("Failed to delete read notifications");
    }
  },

  // Delete all notifications
  deleteAllNotifications: async () => {
    try {
      await axios.delete("/notifications/delete/all");
      set({ notifications: [] });
    } catch (err) {
      toast.error("Failed to delete all notifications");
    }
  },
}));
