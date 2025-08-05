import { create } from "zustand";
import axios from "../lib/axios";
import toast from "react-hot-toast";

export const useProductReviewStore = create((set) => ({
  productReviews: {}, // Lưu các review theo từng productId
  loading: false,

  // Lấy toàn bộ review của một sản phẩm
  fetchProductReviews: async (productId) => {
    set({ loading: true });
    try {
      const res = await axios.get(`/reviews/product/${productId}`);
      set((state) => ({
        productReviews: {
          ...state.productReviews,
          [productId]: res.data, // không lọc, để nguyên tất cả
        },
        loading: false,
      }));
    } catch (err) {
      console.error("Fetch review error:", err);
      toast.error("Không thể tải đánh giá sản phẩm");
      set({ loading: false });
    }
  },

  fetchAllReviewsByProductId: async (productId) => {
    set({ loading: true });
    try {
      const res = await axios.get(`/reviews/product/${productId}/all`);
      set((state) => ({
        productReviews: {
          ...state.productReviews,
          [productId]: res.data,
        },
        loading: false,
      }));
    } catch (err) {
      console.error("Fetch all reviews error:", err);
      toast.error("Không thể tải tất cả đánh giá");
      set({ loading: false });
    }
  },

  // Ẩn/hiện một review cụ thể
  toggleReviewVisibility: async (productId, reviewId, isHidden) => {
    try {
      await axios.patch(`/reviews/${reviewId}/visibility`, { isHidden });
      set((state) => ({
        productReviews: {
          ...state.productReviews,
          [productId]: state.productReviews[productId]?.map((review) =>
            review._id === reviewId ? { ...review, isHidden } : review
          ),
        },
      }));
      toast.success("Đã cập nhật hiển thị đánh giá");
    } catch (err) {
      console.error("Toggle visibility error:", err);
      toast.error("Không thể cập nhật trạng thái đánh giá");
    }
  },

  // ✅ Thêm phản hồi mới
  replyToReview: async (productId, reviewId, content) => {
    if (!reviewId || !content) return toast.error("Thiếu dữ liệu phản hồi");
    try {
      const res = await axios.post(`/reviews/${reviewId}/reply`, { content });
      const updatedReview = res.data.review;
      set((state) => ({
        productReviews: {
          ...state.productReviews,
          [productId]: state.productReviews[productId]?.map((review) =>
            review._id === reviewId ? updatedReview : review
          ),
        },
      }));
      toast.success("Đã phản hồi đánh giá");
    } catch (err) {
      console.error("Reply error:", err.response || err);
      toast.error("Không thể phản hồi đánh giá");
    }
  },

  // ✅ Chỉnh sửa phản hồi
  editReplyToReview: async (productId, reviewId, content) => {
    if (!reviewId || !content) return toast.error("Thiếu nội dung chỉnh sửa");
    try {
      const res = await axios.patch(`/reviews/${reviewId}/reply`, { content });
      const updatedReview = res.data.review;
      set((state) => ({
        productReviews: {
          ...state.productReviews,
          [productId]: state.productReviews[productId]?.map((review) =>
            review._id === reviewId ? updatedReview : review
          ),
        },
      }));
      toast.success("Đã chỉnh sửa phản hồi");
    } catch (err) {
      console.error("Edit reply error:", err.response || err);
      toast.error("Không thể chỉnh sửa phản hồi");
    }
  },

  deleteReply: async (productId, reviewId) => {
    try {
      const res = await axios.put(`/reviews/${reviewId}/reply/delete`);
      const updatedReview = res.data.review;

      set((state) => ({
        productReviews: {
          ...state.productReviews,
          [productId]: state.productReviews[productId]?.map((r) =>
            r._id === reviewId ? updatedReview : r
          ),
        },
      }));

      toast.success("Đã xoá phản hồi");
    } catch (err) {
      toast.error("Xoá phản hồi thất bại");
      console.error(err);
    }
  },
}));
