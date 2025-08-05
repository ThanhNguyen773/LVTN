import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useProductStore = create((set) => ({
  products: [],
  selectedProduct: null,
  featuredProducts: [],
  loading: false,

  searchTerm: "",
  setSearchTerm: (term) => set({ searchTerm: term }),
  triggerSearch: "",
  setTriggerSearch: (term) => set({ triggerSearch: term }),
  suggestions: [],
  setSuggestions: (suggestions) => set({ suggestions }),


  // Set full product list
  setProducts: (products) => set({ products }),
  
  // Fetch all products
  fetchAllProducts: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/products");
      set({ products: res.data.products, loading: false });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load product list.");
      set({ loading: false });
    }
  },

  // Fetch by category
  fetchProductsByCategory: async (category) => {
    set({ loading: true, products: [] });
    try {
      const res = await axios.get(`/products/category/${category}`);
      set({ products: res.data.products, loading: false });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to filter by category.");
      set({ loading: false });
    }
  },

  // Fetch by ID (for details)
  fetchProductById: async (id) => {
    set({ loading: true });
    try {
      const res = await axios.get(`/products/${id}`);
      set({ selectedProduct: res.data, loading: false });
    } catch (error) {
      toast.error("Failed to load product details.");
      set({ loading: false });
    }
  },

  // Create new product
  createProduct: async (productData) => {
    set({ loading: true });
    try {
      const res = await axios.post("/products", productData);
      set((state) => ({
        products: [...state.products, res.data],
        loading: false,
      }));
      toast.success("Product created successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create product.");
      set({ loading: false });
    }
  },

  // Update product
  updateProduct: async (id, updatedData) => {
    set({ loading: true });
    try {
      const res = await axios.put(`/products/${id}`, updatedData);
      set((state) => ({
        products: state.products.map((p) => (p._id === id ? res.data : p)),
        loading: false,
      }));
      toast.success("Product updated successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update product.");
      set({ loading: false });
    }
  },

  // Delete product
  deleteProduct: async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this product?");
    if (!confirm) return;

    set({ loading: true });
    try {
      await axios.delete(`/products/${id}`);
      set((state) => ({
        products: state.products.filter((p) => p._id !== id),
        loading: false,
      }));
      toast.success("Product deleted successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete product.");
      set({ loading: false });
    }
  },

  // Fetch featured products
  fetchFeaturedProducts: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/products/featured");
      set({ featuredProducts: res.data, loading: false });
    } catch (error) {
      toast.error("Failed to load featured products.");
      set({ loading: false });
    }
  },

  // Toggle isFeatured
  toggleFeaturedProduct: async (id) => {
    set({ loading: true });
    try {
      const res = await axios.patch(`/products/${id}`);
      set((state) => ({
        products: state.products.map((p) =>
          p._id === id ? { ...p, isFeatured: res.data.isFeatured } : p
        ),
        loading: false,
      }));
      toast.success("Featured status updated.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update featured status.");
      set({ loading: false });
    }
  },

  // Search by image
  searchProductByImage: async (imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);

    set({ loading: true });
    try {
      const res = await axios.post("/products/search-by-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      set({ products: res.data.results, loading: false });
      toast.success("Matching products found.");
    } catch (error) {
      toast.error("No results found or invalid image.");
      set({ loading: false });
    }
  },

  // Toggle active/inactive
  toggleActiveProduct: async (id) => {
    try {
      const res = await axios.patch(`/products/${id}/toggle-active`);
      const updatedProduct = res.data.product;

      set((state) => ({
        products: state.products.map((product) =>
          product._id === id ? updatedProduct : product
        ),
      }));

      toast.success(res.data.message || "Product status updated.");
    } catch (err) {
      toast.error("Failed to toggle product status.");
    }
  }
}));
