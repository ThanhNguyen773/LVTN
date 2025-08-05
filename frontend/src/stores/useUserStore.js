import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
  users: [],
  user: null,
  loading: false,
  checkingAuth: true,

  signup: async ({
    name,
    email,
    password,
    confirmPassword,
    phone,
    address,
    dateOfBirth,
  }) => {
    set({ loading: true });

    if (password !== confirmPassword) {
      set({ loading: false });
      return toast.error("Mật khẩu xác nhận không khớp!");
    }

    try {
      const res = await axios.post("/auth/signup", {
        name,
        email,
        password,
        phone,
        address,
        dateOfBirth,
      });

      set({ user: res.data, loading: false });
      toast.success("Tạo tài khoản thành công!");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Đăng ký thất bại!");
    }
  },

  login: async (email, password) => {
    set({ loading: true });

    try {
      const res = await axios.post("/auth/login", { email, password });
      set({ user: res.data, loading: false });
      toast.success("Đăng nhập thành công !");
    } catch (error) {
      set({ loading: false });
      toast.error(
        error.response.data.message || "An error occurred during login"
      );
    }
  },

  checkAuth: async () => {
    set({ checkingAuth: true });
    try {
      const response = await axios.get("/auth/profile");
      set({ user: response.data, checkingAuth: false });
    } catch (error) {
      console.log(error.message);
      set({ checkingAuth: false, user: null });
    }
  },

  logout: async () => {
    try {
      await axios.post("/auth/logout");
      set({ user: null });
      toast.success("Đăng xuất thành công !");
    } catch (error) {
      toast.error(
        error.response.data.message || "An error occurred during logout"
      );
    }
  },

  refreshToken: async () => {
    if (get().checkingAuth) return;

    set({ checkingAuth: true });
    try {
      const res = await axios.post("/auth/refresh-token");
      set({ checkingAuth: false });
      return res.data;
    } catch (error) {
      set({ user: null, checkingAuth: false });
      throw error;
    }
  },

  updateUser: async (id, updatedData) => {
    try {
      const res = await axios.put(`/auth/update-profile/${id}`, updatedData);
      set((state) => ({
        users: [...state.users.filter((user) => user._id !== id), res.data],
      }));
      toast.success("Cập nhật người dùng thành công!");
    } catch (error) {
      toast.error("Lỗi khi cập nhật người dùng");
    }
  },

//   deleteUser: async (id) => {
//     try {
//       const confirm = window.confirm(
//         "Bạn có chắc chắn muốn xoá người dùng này không?"
//       );
//       if (!confirm) return;

//       await axios.delete(`/api/auth/user/${id}`);
//       set((state) => ({
//         users: state.users.filter((user) => user._id !== id),
//       }));
//     } catch (err) {
//       console.error("Failed to delete user", err);
//     }
//   },

  fetchAllUsers: async () => {
    try {
      const res = await axios.get("/auth/all");
      if (Array.isArray(res.data)) {
        set({ users: res.data });
      } else {
        console.error("API không trả về array:", res.data);
        set({ users: [] });
      }
    } catch (error) {
      console.error("Lỗi khi fetch users:", error);
      toast.error("Không thể tải danh sách người dùng");
      set({ users: [] });
    }
  },

  deleteUser: async (userId) => {
    try {
      const confirm = window.confirm(
        "Bạn có chắc chắn muốn xoá người dùng này không?"
      );
      if (!confirm) return;
      await axios.delete(`/auth/${userId}`);
      set((state) => ({
        users: state.users.filter((user) => user._id !== userId),
      }));
      toast.success("Xóa người dùng thành công");
    } catch (error) {
      toast.error("Xóa thất bại");
      console.error(error);
    }
  },

  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await axios.put("/auth/me/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const newAvatar = res.data.avatar; // { url, public_id }

      // Cập nhật store
      set((state) => ({
        user: {
          ...state.user,
          avatar: newAvatar,
        },
      }));

      toast.success("Cập nhật ảnh đại diện thành công!");

      // ✅ Chỉ return đường dẫn URL (khớp với formData.avatar)
      return res.data.avatar; // return full { url, public_id }
    } catch (error) {
      console.error("Upload avatar failed", error);
      toast.error("Không thể tải ảnh đại diện");
    }
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    try {
      const res = await axios.put("/auth/me/change-password", {
        currentPassword,
        newPassword,
      });

      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
      return false;
    }
  },
  createStaff: async ({
    name,
    email,
    password,
    phone,
    address,
    dateOfBirth,
  }) => {
    set({ loading: true });
    try {
      const res = await axios.post("/auth/create", {
        name,
        email,
        password,
        phone,
        address,
        dateOfBirth,
        role: "staff", // luôn là staff
      });
      toast.success("Tạo tài khoản nhân viên thành công!");
      set({ loading: false });
      // Tải lại danh sách
      get().fetchAllUsers();
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || "Tạo nhân viên thất bại!");
    }
  },
}));

let refreshPromise = null;

// Axios interceptor for token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // If a refresh is already in progress, wait for it to complete
        if (refreshPromise) {
          await refreshPromise;
          return axios(originalRequest);
        }

        // Start a new refresh process
        refreshPromise = useUserStore.getState().refreshToken();
        await refreshPromise;
        refreshPromise = null;

        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login or handle as needed
        useUserStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
