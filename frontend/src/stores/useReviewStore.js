import { create } from "zustand";
import axios from "../lib/axios";
import toast from "react-hot-toast";

export const useReviewStore = create((set, get) => ({
  reviewsMap: {}, // key: `${productId}-${orderId}` => [reviews]
  loading: false,

  /** ✅ Lấy đánh giá cho sản phẩm trong đơn hàng cụ thể */
  fetchReviewsByProduct: async (productId, orderId) => {
    set({ loading: true });
    try {
      const res = await axios.get(`/reviews/product/${productId}`);
      const allReviews = res.data;

      const filtered = allReviews.filter(
        (r) => r.order === orderId || r.order?._id === orderId
      );

      set((state) => ({
        reviewsMap: {
          ...state.reviewsMap,
          [`${productId}-${orderId}`]: filtered,
        },
        loading: false,
      }));
    } catch (error) {
      toast.error("Failed to load product reviews");
      set({ loading: false });
    }
  },

  /** ✅ Gửi đánh giá */
  createReview: async (reviewData) => {
    set({ loading: true });
    try {
      const res = await axios.post("/reviews", reviewData);

      const key = `${reviewData.product}-${reviewData.order}`;
      const existing = get().reviewsMap[key] || [];

      set((state) => ({
        reviewsMap: {
          ...state.reviewsMap,
          [key]: [res.data, ...existing],
        },
        loading: false,
      }));

      toast.success("Review submitted successfully");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to submit review");
      set({ loading: false });
    }
  },

  /** ✅ Cập nhật đánh giá */
  updateReview: async (id, updatedData, productId, orderId) => {
    try {
      const res = await axios.patch(`/reviews/${id}`, updatedData);
      const key = `${productId}-${orderId}`;

      set((state) => {
        const updatedList = (state.reviewsMap[key] || []).map((r) =>
          r._id === id ? res.data : r
        );
        return {
          reviewsMap: {
            ...state.reviewsMap,
            [key]: updatedList,
          },
        };
      });

      toast.success("Review updated");
    } catch (error) {
      toast.error("Failed to update review");
    }
  },

  /** ✅ Xoá đánh giá */
  deleteReview: async (id, productId, orderId) => {
    try {
      await axios.delete(`/reviews/${id}`);
      const key = `${productId}-${orderId}`;

      set((state) => {
        const filtered = (state.reviewsMap[key] || []).filter((r) => r._id !== id);
        return {
          reviewsMap: {
            ...state.reviewsMap,
            [key]: filtered,
          },
        };
      });

      toast.success("Review deleted");
    } catch (error) {
      toast.error("Failed to delete review");
    }
  },
}));
