import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useCouponStore = create((set) => ({
  coupons: [],
  loading: false,

  fetchCoupons: async () => {
  set({ loading: true });
  try {
    const res = await axios.get("/coupons");
    const data = Array.isArray(res.data) ? res.data : res.data.coupons || [];
    set({ coupons: data, loading: false });
  } catch (err) {
    set({ loading: false });
    toast.error("Lỗi khi tải danh sách mã giảm giá");
  }
},


  createCoupon: async (data) => {
  set({ loading: true });
  try {
    const res = await axios.post("/coupons", data);
    set((state) => ({
      coupons: [...state.coupons, res.data],
      loading: false,
    }));
    toast.success("Tạo mã giảm giá thành công!");
    return true; // 👈 THÊM DÒNG NÀY
  } catch (err) {
    set({ loading: false });
    toast.error(err.response?.data?.message || "Lỗi khi tạo mã giảm giá");
    return false; // 👈 THÊM DÒNG NÀY
  }
},


  deleteCoupon: async (id) => {
    set({ loading: true });
    try {
      const confirm = window.confirm("Bạn có chắc chắn muốn xoá mã giảm giá?");
      if (!confirm) return;
      await axios.delete(`/coupons/${id}`);
      set((state) => ({
        coupons: state.coupons.filter((c) => c._id !== id),
        loading: false,
      }));
      toast.success("Xoá mã giảm giá thành công!");
    } catch (err) {
      set({ loading: false });
      toast.error("Lỗi khi xoá mã giảm giá");
    }
  },

  deleteAllCoupons: async () => {
    try {
      const confirm = window.confirm("Bạn có chắc chắn muốn xoá tất cả mã giảm giá?");
      if (!confirm) return;

      await axios.delete("/coupons/all");
      set({ coupons: [] });
      toast.success("Đã xoá tất cả mã giảm giá!");
    } catch (error) {
      toast.error("Lỗi khi xoá tất cả mã giảm giá");
    }
  },

  fetchActiveCoupons: async () => {
  set({ loading: true });
  try {
    const res = await axios.get("/coupons/user/active");
    const data = Array.isArray(res.data) ? res.data : res.data.coupons || [];
    set({ coupons: data, loading: false });
  } catch (err) {
    set({ loading: false });
    toast.error("Lỗi khi tải mã giảm giá đang hoạt động");
  }
},


updateCoupon: async (id, data) => {
  set({ loading: true });
  try {
    const res = await axios.put(`/coupons/${id}`, data);
    set((state) => ({
      coupons: state.coupons.map((c) =>
        c._id === id ? res.data.coupon : c
      ),
      loading: false,
    }));
    toast.success("Cập nhật mã giảm giá thành công!");
    return true;
  } catch (err) {
    set({ loading: false });
    toast.error("Lỗi khi cập nhật mã");
    return false;
  }
}




}));
