import { motion } from "framer-motion";
import Breadcrumb from "../components/Breadcrumb";
import WishlistSection from "../components/WishlistSection";

const WishlistPage = () => {
  
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Wishlist" },
  ];

  return (
    <div className="min-h-screen mb-12">
      {/* Tiêu đề và Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-b from-[#0a0a1f] to-transparent w-full py-6 shadow-sm"
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="text-3xl sm:text-5xl font-bold text-blue-300 mt-2 text-center">
            Favorites
          </h1>
        </div>
      </motion.div>

      {/* Danh sách yêu thích */}
      <WishlistSection />
    </div>
  );
};

export default WishlistPage;
