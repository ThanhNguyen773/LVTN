import { ShoppingCart, Box, Tag, AlertTriangle, HeartOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";
import { useWishlistStore } from "../stores/useWishlistStore";
import toast from "react-hot-toast";
import StarRating from "./StarRating";

const categoryMap = {
  hg: "High Grade",
  rg: "Real Grade",
  mg: "Master Grade",
  pg: "Perfect Grade",
  sd: "Super Deformed",
  tools: "Tools",
  decal: "Paint & Decal",
  other: "Other Product",
};

const ProductCardHorizontal = ({ product }) => {
  const { user } = useUserStore();
  const { addToCart } = useCartStore();
  const { removeFromWishlist } = useWishlistStore();
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please log in to add to cart!");
      return;
    }
    addToCart(product);
  };

  const handleRemoveFromWishlist = (e) => {
    e.stopPropagation();
    removeFromWishlist(product._id);
    
  };

  const handleCardClick = () => {
    navigate(`/products/${product._id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="flex w-full max-w-2xl rounded-xl border border-gray-700 bg-slate-900 hover:border-blue-500 transition cursor-pointer overflow-hidden shadow-md hover:shadow-lg"
    >
      <div className="w-32 h-32 flex-shrink-0 relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
        />
      </div>

      <div className="flex flex-col justify-between p-4 flex-1 relative">
        {/* Nút xoá wishlist */}
        <button
          onClick={handleRemoveFromWishlist}
          title="Remove from wishlist"
          className="absolute top-2 right-2 text-pink-500 hover:text-red-500 transition"
        >
          <HeartOff size={20} />
        </button>

        <div>
          <h4 className="text-white font-semibold text-base line-clamp-2">{product.name}</h4>
          <div className="flex items-center text-xs text-gray-400 mt-1 gap-3 flex-wrap">
            <span className="flex items-center gap-1">
              <Tag size={14} />
              {categoryMap[product.category] || "Uncategorized"}
            </span>
            <span className="flex items-center gap-1">
              <Box size={14} />
              Sold: {product.sold || 0}
            </span>
          </div>

          <div className="mt-1">
            <StarRating rating={product.rating || 0} totalReviews={product.totalReviews || 0} />
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="text-blue-400 font-bold text-lg">${product.price}</div>
          {product.isActive ? (
            <button
              onClick={handleAddToCart}
              title="Add to cart"
              className="flex items-center gap-1 text-white bg-blue-500 hover:bg-blue-600 rounded-md px-3 py-1 text-sm transition"
            >
              <ShoppingCart size={16} />
              Add
            </button>
          ) : (
            <div
              className="flex items-center gap-1 text-gray-400 text-sm opacity-70"
              title="Out of stock or backorder"
            >
              <AlertTriangle size={16} />
              Backorder
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCardHorizontal;
