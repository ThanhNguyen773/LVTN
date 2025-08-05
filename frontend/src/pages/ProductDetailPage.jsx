import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useProductStore } from "../stores/useProductStore";
import { useCartStore } from "../stores/useCartStore";
import { useProductReviewStore } from "../stores/useProductReviewStore";
import { useUserStore } from "../stores/useUserStore";
import { useWishlistStore } from "../stores/useWishlistStore";
import toast from "react-hot-toast";

import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import { ShoppingCart, Box, Tag, Truck, Heart, HeartOff } from "lucide-react";

import StarRating from "../components/StarRating";
import ModelViewer from "../components/ModelViewer";
import ReviewDisplay from "../components/ReviewDisplay";
import { motion } from "framer-motion";
import LoadingSpinner from "../components/LoadingSpinner";
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

// Các phần giữ nguyên...

const ProductDetailPage = () => {
  const { productId } = useParams();
  const { selectedProduct, fetchProductById, loading } = useProductStore();
  const { addToCart } = useCartStore();
  const { fetchProductReviews, productReviews } = useProductReviewStore();
  const { user } = useUserStore();
  const [quantity, setQuantity] = useState(1);

  const { wishlist, addToWishlist, removeFromWishlist, isInWishlist } =
    useWishlistStore();

  const [show3D, setShow3D] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const navigate = useNavigate();
  const tabRef = useRef(null);

  const getDeliveryEstimate = () => {
    if (!selectedProduct) return "Loading...";

    const today = new Date();
    const formatENDate = (date) =>
      date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

    const from = new Date(today);
    const to = new Date(today);

    if (selectedProduct.isActive) {
      from.setDate(from.getDate() + 3);
      to.setDate(to.getDate() + 7);
    } else {
      from.setDate(from.getDate() + 10);
      to.setDate(to.getDate() + 13);
    }

    return `${formatENDate(from)} - ${formatENDate(to)}`;
  };

  const deliveryRange = getDeliveryEstimate();

  useEffect(() => {
    fetchProductById(productId);
    fetchProductReviews(productId);
  }, [productId]);

  if (loading || !selectedProduct) {
    return <LoadingSpinner />;
  }

  const handleToggleWishlist = () => {
    if (!user) {
      toast.error("Please log in to use wishlist!", { id: "wishlist-login" });
      return;
    }

    if (isInWishlist(selectedProduct._id)) {
      removeFromWishlist(selectedProduct._id);
    } else {
      addToWishlist(selectedProduct);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please log in to add products to your cart!", {
        id: "login",
      });
      return;
    }

    addToCart({ ...selectedProduct, quantity }); // ✅ quantity từ state
    setQuantity(1); 
  };

  const isNewProduct = () => {
    const createdDate = new Date(selectedProduct.createdAt);
    const now = new Date();
    const diffInDays = (now - createdDate) / (1000 * 60 * 60 * 24);
    return diffInDays <= 7;
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setTimeout(() => {
      tabRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "All Products", href: "/products" },
    {
      label: categoryMap[selectedProduct.category] || "Category",
      href: `/products/category/${selectedProduct.category}`,
    },
    { label: selectedProduct.name },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-5 text-white space-y-2">
      <Breadcrumb items={breadcrumbItems} />

      {/* Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left: Image or 3D Viewer */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative rounded-xl overflow-hidden shadow-lg aspect-square bg-black"
        >
          {isNewProduct() && (
            <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
              NEW
            </div>
          )}

          {!show3D ? (
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <ModelViewer modelUrl={selectedProduct.modelUrl} />
          )}

          {selectedProduct.modelUrl && (
            <button
              onClick={() => setShow3D((prev) => !prev)}
              className="absolute top-4 right-4 bg-gray-900/80 hover:bg-gray-700 text-emerald-300 hover:text-emerald-500 px-3 py-1 rounded-md flex items-center gap-1 text-sm shadow"
            >
              <Box size={16} />
              {show3D ? "Hide 3D" : "View 3D"}
            </button>
          )}
        </motion.div>

        {/* Right: Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col justify-between"
        >
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-blue-300">
              {selectedProduct.name}
            </h1>

            <div className="flex flex-wrap items-center text-sm gap-4 text-gray-300">
              <span className="flex items-center gap-1">
                <Tag size={16} />
                {categoryMap[selectedProduct.category] || "Uncategorized"}
              </span>
              <span className="flex items-center gap-1">
                <Box size={16} />
                Sold: {selectedProduct.sold || 0}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <StarRating
                rating={selectedProduct.averageRating || 0}
                size={20}
              />
              <span className="text-sm text-gray-400">
                {selectedProduct.averageRating?.toFixed(1) || "0.0"} / 5.0 (
                {selectedProduct.ratingCount || 0}{" "}
                {selectedProduct.ratingCount === 1 ? "review" : "reviews"})
              </span>
            </div>

            <div className="flex items-end gap-4 mt-6">
              {/* Giá thật */}
              <p className="text-5xl md:text-6xl font-extrabold text-emerald-400 drop-shadow-sm">
                ${selectedProduct.price?.toFixed(2)}
              </p>

              {/* Giá ảo (tăng 20%) */}
              <p className="text-xl md:text-3xl text-gray-400 line-through">
                ${(selectedProduct.price * 1.2).toFixed(2)}
              </p>
            </div>

            {/* Shipping Estimate */}
            <div className="flex items-start gap-3 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 shadow">
              <div className="bg-blue-900/40 rounded-full p-2">
                <Truck className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-white">Shipping</p>
                <p className="text-gray-300">
                  🚚 Delivered between{" "}
                  <span className="text-emerald-400 font-medium">
                    {deliveryRange}
                  </span>{" "}
                  — <span className="text-yellow-400 font-semibold">FREE</span>{" "}
                  shipping
                </p>
              </div>
            </div>

            {/* Refund Notice */}
            <div className="bg-yellow-900/40 border border-yellow-700 text-yellow-300 text-sm rounded-xl px-4 py-3 shadow mt-3">
              <p className="font-bold uppercase tracking-wide text-yellow-400 mb-1">
                No Refund or Cancellation
              </p>
              <p>
                We do not separate orders, nor do we separate combo products and
                ship them before the estimated shipping time. If you want to
                receive products individually as soon as they are available,
                please order them separately.
              </p>
            </div>
          </div>

          {selectedProduct.isActive ? (
            <div className="bg-emerald-100 text-emerald-800 p-4 rounded-xl mt-6 text-sm leading-relaxed shadow-sm">
              ✅ <strong>This product is currently IN STOCK!</strong> Your order
              will be processed quickly and is expected to be delivered to you
              within 3 - 7 business days from the order confirmation date.
              <br />
              <span className="italic text-emerald-700">
                Please note: Delivery times may vary slightly depending on your
                shipping location and external factors (such as adverse weather
                or public holidays).
              </span>
            </div>
          ) : (
            <div className="bg-yellow-100 text-yellow-800 p-4 rounded-xl mt-6 text-sm leading-relaxed shadow-sm">
              ⚠️ <strong>This is a backorder item.</strong> Expected
              availability depends on the next production release.
              <br />
              Release month may change due to manufacturing delays.
              <br />
              Slots are limited and may close early — order soon!
            </div>
          )}
          <div className="flex items-center gap-3 mt-4">
            <span className="text-sm font-medium text-gray-300">Quantity:</span>
            <div className="flex items-center bg-gray-800 border border-gray-600 rounded-md overflow-hidden">
              <button
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="px-3 py-1 text-white hover:bg-gray-700 transition disabled:opacity-50"
                disabled={quantity <= 1}
              >
                −
              </button>
              <span className="px-4 text-white">{quantity}</span>
              <button
                onClick={() => setQuantity((prev) => prev + 1)}
                className="px-3 py-1 text-white hover:bg-gray-700 transition"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex gap-6 mt-4 items-center">
            {/* Add to Cart */}
            <motion.button
              onClick={handleAddToCart}
              animate={{
                x: [0, -60, 60, -60, 60, -40, 40, -20, 20, 0],
              }}
              transition={{
                duration: 1,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 2, // lặp lại mỗi 2 giây, có thể giảm còn 1 nếu muốn liên tục hơn
              }}
              className="flex-1 flex justify-center items-center gap-2 
                bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700
                text-white py-3 rounded-xl 
                shadow-[0_0_30px_rgba(59,130,246,0.9)]
                transition duration-300 font-bold disabled:opacity-50 border border-blue-300"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse at top, rgba(37,99,235,0.4) 0%, rgba(30,64,175,0.3) 45%, rgba(15,23,42,0.2) 100%)",
                backdropFilter: "blur(2px)",
              }}
            >
              <ShoppingCart size={20} />
              ADD TO CART
            </motion.button>

            {/* Wishlist */}
            <button
              onClick={handleToggleWishlist}
              className="w-12 h-12 flex justify-center items-center bg-pink-500 hover:bg-pink-600 text-white rounded-xl shadow-md transition duration-200 font-bold disabled:opacity-50"
            >
              {isInWishlist(selectedProduct._id) ? (
                <HeartOff size={20} />
              ) : (
                <Heart size={20} />
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Tabs: Description & Review */}
      <div className="mt-10">
        {/* Tabs header */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => handleTabChange("description")}
            className={`px-6 py-3 font-semibold transition duration-200 ${
              activeTab === "description"
                ? "border-b-2 border-emerald-400 text-emerald-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Description
          </button>
          <button
            onClick={() => handleTabChange("review")}
            className={`px-6 py-3 font-semibold transition duration-200 ${
              activeTab === "review"
                ? "border-b-2 border-emerald-400 text-emerald-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Customer Reviews
          </button>
        </div>

        {/* Tabs content */}
        <div ref={tabRef} className="mt-4">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "description" && (
              <div className="bg-gray-900/40 p-4 rounded-lg text-gray-300 leading-relaxed whitespace-pre-line">
                {selectedProduct.description}
              </div>
            )}

            {activeTab === "review" && (
              <div className="space-y-4">
                {productReviews[productId]?.length > 0 ? (
                  <div className="space-y-4 bg-gray-900/40 p-4 rounded-lg">
                    {productReviews[productId]
                      .filter((review) => {
                        if (!review.isHide) return true;
                        if (!user) return false;
                        return (
                          user.role === "admin" ||
                          user.role === "staff" ||
                          review.user?._id === user._id
                        );
                      })
                      .map((review) => (
                        <ReviewDisplay key={review._id} review={review} />
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-400 italic">
                    There are no reviews for this product yet.
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
