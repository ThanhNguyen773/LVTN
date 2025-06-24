import axios from "axios";
import toast from "react-hot-toast";
import {create} from "zustand";

export const useProductStore = create((set) => ({
    products: [],
    loading: false,

    setProducts: (products) => set({ products }),
	createProduct: async (productData) => {
		set({ loading: true });
		try {
            console.log("ccc");
			const res = await axios.post("/products", productData);
            console.log("ccc1");
			set((prevState) => ({
				products: [...prevState.products, res.data],
				loading: false,
			}));
		} catch (error) {
			toast.error(error.response.data.error);
			set({ loading: false });
		}
	},

    
}));