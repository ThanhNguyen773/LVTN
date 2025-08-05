// src/stores/useBannerStore.js
import { create } from "zustand";
import axios from "axios";

const SOFT_DELETE_DELAY = 7000; // ms

export const useBannerStore = create((set, get) => ({
  banners: [],
  loading: false,
  pendingDeletes: {}, // { [id]: timeoutId }

  fetchBanners: async () => {
    try {
      set({ loading: true });
      const res = await axios.get("/api/banners");
      set({ banners: Array.isArray(res.data) ? res.data : [], loading: false });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách banner:", error.message);
      set({ loading: false });
    }
  },

  addBanner: async (newBanner) => {
    try {
      const res = await axios.post("/api/banners", newBanner);
      set((state) => ({
        banners: [res.data, ...state.banners],
      }));
    } catch (error) {
      console.error("Lỗi khi thêm banner:", error.message);
    }
  },

  _finalizeDelete: async (id) => {
    try {
      await axios.delete(`/api/banners/${id}`);
    } catch (error) {
      console.error("Lỗi xoá banner thực sự:", error.message);
      // có thể reload lại danh sách hoặc báo lỗi
      get().fetchBanners();
    }
  },

  deleteBanner: (id) => {
    // optimistic: ẩn ngay
    set((state) => ({
      banners: state.banners.filter((b) => b._id !== id),
    }));

    // đặt timeout để thực sự xoá
    const timeoutId = setTimeout(() => {
      get()._finalizeDelete(id);
      set((state) => {
        const { [id]: _, ...rest } = state.pendingDeletes;
        return { pendingDeletes: rest };
      });
    }, SOFT_DELETE_DELAY);

    set((state) => ({
      pendingDeletes: { ...state.pendingDeletes, [id]: timeoutId },
    }));
  },

  undoDelete: (id, bannerData) => {
    const timeoutId = get().pendingDeletes[id];
    if (timeoutId) {
      clearTimeout(timeoutId);
      set((state) => {
        const { [id]: _, ...rest } = state.pendingDeletes;
        return {
          banners: [bannerData, ...state.banners],
          pendingDeletes: rest,
        };
      });
    }
  },

  toggleActive: async (id) => {
    // optimistic update (tạm đổi trước)
    const prev = get().banners.find((b) => b._id === id);
    set((state) => ({
      banners: state.banners.map((b) =>
        b._id === id ? { ...b, isActive: !b.isActive, _optimistic: true } : b
      ),
    }));
    try {
      const { data } = await axios.patch(`/api/banners/${id}/toggle`);
      set((state) => ({
        banners: state.banners.map((b) =>
          b._id === id ? { ...b, isActive: data.isActive, _optimistic: false } : b
        ),
      }));
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái banner:", error.message);
      // rollback
      set((state) => ({
        banners: state.banners.map((b) =>
          b._id === id ? { ...b, isActive: prev?.isActive, _optimistic: false } : b
        ),
      }));
    }
  },

  fetchBannersByCategory: async (category) => {
    try {
      const res = await axios.get(`/api/banners/category/${category}`);
      set({ banners: res.data.banners });
    } catch (error) {
      console.error("Lỗi khi lấy banner theo category:", error.message);
    }
  },
}));
