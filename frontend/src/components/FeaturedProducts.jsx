import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";

const FeaturedProducts = ({ featuredProducts }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  // Chỉ lấy các sản phẩm nổi bật và còn hoạt động
  const activeFeatured = featuredProducts;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerPage(1);
      else if (window.innerWidth < 1024) setItemsPerPage(2);
      else if (window.innerWidth < 1280) setItemsPerPage(3);
      else setItemsPerPage(4);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + itemsPerPage, activeFeatured.length - itemsPerPage));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - itemsPerPage, 0));
  };

  const isStartDisabled = currentIndex === 0;
  const isEndDisabled = currentIndex >= activeFeatured.length - itemsPerPage;

  const visibleProducts = activeFeatured.slice(currentIndex, currentIndex + itemsPerPage);

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <h3 className="flex items-center justify-center gap-3 text-center text-3xl sm:text-6xl font-bold text-blue-300 mb-4">
          Featured Products
        </h3>

        <div className="relative mt-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Nút điều hướng */}
          <button
            onClick={prevSlide}
            disabled={isStartDisabled}
            className={`absolute top-1/2 -left-4 transform -translate-y-1/2 p-2 rounded-full transition-colors duration-300 z-10 ${
              isStartDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-400 hover:bg-blue-500"
            }`}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={nextSlide}
            disabled={isEndDisabled}
            className={`absolute top-1/2 -right-4 transform -translate-y-1/2 p-2 rounded-full transition-colors duration-300 z-10 ${
              isEndDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-400 hover:bg-blue-500"
            }`}
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProducts;
