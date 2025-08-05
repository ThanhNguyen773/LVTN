import { useState, useEffect } from "react";
import { ShoppingCart, Box, Tag, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";
import { useNavigate } from "react-router-dom";
import axios from "../lib/axios";
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

const ProductCard = ({ product }) => {
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const { user } = useUserStore();
  const { addToCart } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`/reviews/product/${product._id}`);
        const reviews = res.data;
        const avg =
          reviews.length > 0
            ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
            : 0;
        setAverageRating(avg);
        setTotalReviews(reviews.length);
      } catch (err) {
        console.error("Lỗi khi lấy đánh giá:", err);
      }
    };
    fetchReviews();
  }, [product._id]);

  const isNewProduct = () => {
    if (!product.createdAt) return false;
    const createdDate = new Date(product.createdAt);
    const now = new Date();
    const diffInDays = (now - createdDate) / (1000 * 60 * 60 * 24);
    return diffInDays <= 7;
  };

  const handleAddToCart = (e) => {
    e.stopPropagation(); // Ngăn click bubble lên card
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!", {
        id: "login",
      });
      return;
    }

    const ripple = document.createElement("span");
    ripple.className = "ripple";
    e.currentTarget.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);

    addToCart(product);
  };

  const handleCardClick = () => {
    navigate(`/products/${product._id}`);
  };


  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col w-full max-w-xs sm:max-w-none rounded-2xl border border-gray-700 shadow-md bg-gradient-to-br from-slate-800 via-slate-900 to-black hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:border-blue-400"
    >
      <div className="relative h-48 sm:h-60 overflow-hidden rounded-t-2xl">
        {isNewProduct() && (
          <div className="absolute top-2 left-2 border border-red-500 text-red-500 text-xs font-bold px-2 py-1 rounded-full bg-transparent backdrop-blur-sm z-10"
          title="🆕 New: This product was added within the last 7 days!">
            New
          </div>
        )}

        {product.sold > 50 && (
          <div className="absolute top-2 right-2 border border-orange-500 text-orange-500 text-xs font-semibold px-2 py-1 rounded-full bg-transparent backdrop-blur-sm z-10"
          title="🔥 Best Seller: This product has sold over 50 units!">
            🔥 HOT
          </div>
        )}

        {product.isFeatured && (
          <div className="absolute bottom-2 left-2 text-xs font-semibold px-2 py-1 rounded-full bg-black/70 text-yellow-300 border border-yellow-400 backdrop-blur-sm z-10"
          title="🌟 Featured: This product is highlighted for its quality and popularity!">
            🌟 Featured
          </div>
        )}


        <img
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
          src={product.image}
          alt={product.name}
        />
        <div className="absolute inset-0 bg-black bg-opacity-10" />
      </div>

      <div className="flex flex-col flex-1 px-4 sm:px-5 py-3 sm:py-4">
        <h5 className="text-base sm:text-lg font-semibold text-white mb-1 line-clamp-3 min-h-14">{product.name}</h5>

        <div className="flex items-center text-xs text-gray-400 mb-1 gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            <Tag size={14} />
            <span className="italic capitalize">
              {categoryMap[product.category] || "Uncategorized"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Box size={14} />
            <span className="italic">Sold: {product.sold || 0}</span>
          </div>
        </div>

        <div className="flex gap-3 mb-2">
          <StarRating rating={averageRating} totalReviews={totalReviews} showCount />
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-400">Price</p>
          <div className="flex items-baseline gap-2">
            <p className="text-xl sm:text-2xl font-bold text-blue-400">
              ${product.price}
            </p>
            <p className="text-sm sm:text-base text-gray-500 line-through">
              ${(product.price * 1.2).toFixed(2)}
            </p>
          </div>
        </div>


        {product.isActive ? (
          <button
            onClick={handleAddToCart}
            title="✅ In stock — Add this item to your cart."
            className="relative overflow-hidden mt-auto flex items-center justify-center rounded-md bg-blue-400 hover:bg-blue-600 text-white py-2 px-3 sm:px-4 text-sm sm:text-base font-medium transition-all"          >
            <ShoppingCart size={20} className="mr-2" />
            Add To Cart
          </button>
        ) : (
          <div
            className="mt-auto flex items-center justify-center rounded-md bg-gray-600 text-white py-2 px-3 text-sm opacity-60 cursor-not-allowed"
            title="⚠️ Backorder: Expected availability depends on the next production run. Delivery estimate is 10–13 days."

          >
            <AlertTriangle size={20} className="mr-2" />
            Backorder Item
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
