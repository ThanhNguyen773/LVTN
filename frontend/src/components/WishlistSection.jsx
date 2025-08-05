import { useEffect } from "react";
import { motion } from "framer-motion";
import { useWishlistStore } from "../stores/useWishlistStore";
import ProductCardHorizontal from "./ProductCardHorizontal";
import LoadingSpinner from "./LoadingSpinner";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

const WishlistSection = () => {
  const { wishlist, fetchWishlist, loading } = useWishlistStore();

  useEffect(() => {
    fetchWishlist();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 pt-10 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {wishlist?.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 space-y-6">
            <div className="bg-pink-600/10 p-6 rounded-full">
              <Heart className="w-20 h-20 text-pink-400" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold text-white">Your wishlist is empty</h2>
            <p className="text-gray-400 max-w-md">
              You haven't added any items to your favorites yet. Browse our collection and find something you love!
            </p>
            <Link
              to="/products"
              className="inline-block bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-full text-sm font-medium transition-all shadow-md"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {wishlist.map((product) => (
              <ProductCardHorizontal key={product._id} product={product} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default WishlistSection;
