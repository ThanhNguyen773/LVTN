// useSettingStore.js
import { create } from "zustand";
import axios from "../lib/axios";

const DEFAULT_SETTING = {
  storeName: "",
  aboutUs: "",
  socialLinks: {
    facebook: "",
    instagram: "",
    linkedin: "",
    youtube: "",
  },
  maintenanceMode: {
    isActive: false,
    message: "",
  },
  theme: {
    primaryColor: "",
    secondaryColor: "",
    logoDark: "",
    favicon: "",
  },
  logo: "",
  updatedBy: null,
  createdAt: null,
  updatedAt: null,
};

export const useSettingStore = create((set, get) => ({
  setting: { ...DEFAULT_SETTING },
  loading: false,
  error: null,

  fetchSetting: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get("/settings"); // điều chỉnh nếu baseURL khác
      set({ setting: res.data, loading: false });
    } catch (err) {
      console.error("fetchSetting error:", err);
      set({
        error:
          err?.response?.data?.message ||
          err.message ||
          "Lỗi khi lấy cấu hình",
        loading: false,
      });
    }
  },

  /**
   * payload: {
   *   storeName, aboutUs,
   *   facebook, instagram, linkedin, youtube,
   *   isActive, message,
   *   theme: { primaryColor, secondaryColor, logoDark, favicon },
   *   logoFile: File | null
   * }
   */
  updateSetting: async (payload) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append("storeName", payload.storeName);
      formData.append("aboutUs", payload.aboutUs || "");
      formData.append("facebook", payload.facebook || "");
      formData.append("instagram", payload.instagram || "");
      formData.append("linkedin", payload.linkedin || "");
      formData.append("youtube", payload.youtube || "");
      formData.append("isActive", payload.isActive ? "true" : "false");
      formData.append("message", payload.message || "");

      if (payload.theme) {
        if (typeof payload.theme.primaryColor !== "undefined")
          formData.append("theme[primaryColor]", payload.theme.primaryColor);
        if (typeof payload.theme.secondaryColor !== "undefined")
          formData.append("theme[secondaryColor]", payload.theme.secondaryColor);
        if (typeof payload.theme.logoDark !== "undefined")
          formData.append("theme[logoDark]", payload.theme.logoDark);
        if (typeof payload.theme.favicon !== "undefined")
          formData.append("theme[favicon]", payload.theme.favicon);
      }

      if (payload.logoFile) {
        formData.append("logo", payload.logoFile);
      }

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      const res = await axios.put("/settings", formData, config);
      set({ setting: res.data.setting, loading: false });
      return res.data.setting;
    } catch (err) {
      console.error("updateSetting error:", err);
      set({
        error:
          err?.response?.data?.message ||
          err.message ||
          "Lỗi khi cập nhật cấu hình",
        loading: false,
      });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
