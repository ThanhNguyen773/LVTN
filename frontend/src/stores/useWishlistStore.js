import { create } from "zustand";
import axios from "../lib/axios";
import toast from "react-hot-toast";

export const useWishlistStore = create((set, get) => ({
  wishlist: [],
  loading: false,

  syncWishlist: (wishlistFromUser) => {
    set({ wishlist: wishlistFromUser || [] });
  },

  fetchWishlist: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/wishlist");
      set({ wishlist: res.data });
    } catch (err) {
      toast.error("Failed to load wishlist.");
    } finally {
      set({ loading: false });
    }
  },

  addToWishlist: async (product) => {
    try {
      await axios.post(`/wishlist/${product._id}`);
      set((state) => ({
        wishlist: [...state.wishlist, product],
      }));
      toast.success("Added to wishlist");
    } catch (err) {
      toast.error("Failed to add to wishlist.");
    }
  },

  removeFromWishlist: async (productId) => {
    try {
      await axios.delete(`/wishlist/${productId}`);
      set((state) => ({
        wishlist: state.wishlist.filter((item) => item._id !== productId),
      }));
      toast.success("Removed from wishlist");
    } catch (err) {
      toast.error("Failed to remove from wishlist.");
    }
  },

  isInWishlist: (productId) => {
    return get().wishlist.some((item) => item._id === productId);
  },
}));
