import { useState, useEffect, useMemo } from "react";
import { useProductStore } from "../stores/useProductStore";
import ProductCard from "../components/ProductCard";
import {
  Mic,
  Image,
  ArrowLeftCircle,
  Search,
  Sparkles,
  Star,
  Flame,
  CheckCircle,
  AlertTriangle,
  Package,
} from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";
import toast from "react-hot-toast";
import ImageSearchModal from "../components/ImageSearchModal";

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

const ProductPage = () => {
  const { products, fetchAllProducts, searchProductByImage } =
    useProductStore();
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 24;

  const [searchTerm, setSearchTerm] = useState("");
  const [triggerSearch, setTriggerSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("default");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [onlyNewProducts, setOnlyNewProducts] = useState(false);
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [onlyActive, setOnlyActive] = useState(false);
  const [onlyBestSeller, setOnlyBestSeller] = useState(false);
  const [onlyBackorder, setOnlyBackorder] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [isImageSearch, setIsImageSearch] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggestionVisible, setIsSuggestionVisible] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  useEffect(() => {
    setIsSearching(true);
    const timeout = setTimeout(() => {
      setTriggerSearch(searchTerm.trim());
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    if (!searchTerm || !products.length) {
      setSuggestions([]);
      return;
    }

    const matched = products
      .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 6);

    setSuggestions(matched);
  }, [searchTerm, products]);

  const handleVoiceSearch = () => {
    if (!SpeechRecognition) {
      alert("Your browser does not support voice recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";

    setIsVoiceSearching(true); // Bắt đầu nghe
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchTerm(transcript);
      setIsVoiceSearching(false); // Ngừng khi đã nhận kết quả
    };

    recognition.onerror = (event) => {
      console.error("Voice recognition error:", event.error);
      toast.error("Voice recognition failed.");
      setIsVoiceSearching(false); // Ngừng khi có lỗi
    };

    recognition.onend = () => {
      setIsVoiceSearching(false); // Đảm bảo tắt nếu mic tắt
    };
  };

  const handleImageSearchWrapper = async (file) => {
    try {
      setIsUploadingImage(true);
      await searchProductByImage(file);
      setIsImageSearch(true);
    } catch (error) {
      console.error("Image search error:", error?.message || error);
      toast.error("Unknown error.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageSearch = async (e) => {
    const file = e.target.files[0];
    if (!file) return toast.error("Please select an image.");
    try {
      setIsUploadingImage(true);
      await searchProductByImage(file);
      setIsImageSearch(true);
    } catch (error) {
      console.error("Image search error:", error.message);
      toast.error("Unknown error.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];

    return products
      .filter((product) =>
        product.name.toLowerCase().includes(triggerSearch.toLowerCase())
      )
      .filter((product) =>
        categoryFilter === "all" ? true : product.category === categoryFilter
      )
      .filter((product) => {
        const price = product.price;
        const min = parseFloat(minPrice);
        const max = parseFloat(maxPrice);
        if (!isNaN(min) && price < min) return false;
        if (!isNaN(max) && price > max) return false;
        return true;
      })
      .filter((product) => {
        if (!onlyNewProducts) return true;
        const createdDate = new Date(product.createdAt);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return createdDate >= sevenDaysAgo;
      })
      .filter((product) => (onlyFeatured ? product.isFeatured : true))
      .filter((product) => (onlyActive ? product.isActive : true))
      .filter((product) => (onlyBackorder ? !product.isActive : true))
      .filter((product) => product.averageRating >= minRating)
      .filter((product) => (onlyBestSeller ? product.sold >= 50 : true))
      .sort((a, b) => {
        if (sortOrder === "priceAsc") return a.price - b.price;
        if (sortOrder === "priceDesc") return b.price - a.price;
        if (sortOrder === "ratingAsc") return a.averageRating - b.averageRating;
        if (sortOrder === "ratingDesc")
          return b.averageRating - a.averageRating;
        return 0;
      });
  }, [
    products,
    triggerSearch,
    categoryFilter,
    minPrice,
    maxPrice,
    onlyNewProducts,
    onlyFeatured,
    onlyActive,
    onlyBackorder,
    onlyBestSeller,
    sortOrder,
    minRating,
  ]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    triggerSearch,
    categoryFilter,
    sortOrder,
    onlyNewProducts,
    onlyFeatured,
    onlyActive,
    onlyBestSeller,
    minRating,
  ]);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "All Products" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filter toggle button on mobile */}
        <button
          className="md:hidden mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          onClick={() => setShowFilters((prev) => !prev)}
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
        {/* Sidebar */}
        {!showFilters && (
          <aside
            className={`md:w-1/5 w-full bg-gray-900 p-5 rounded-lg shadow-md space-y-6 
    ${showFilters ? "block" : "hidden"} md:block`}
          >
            <div>
              <h3 className="text-xl font-bold text-blue-300 mb-3 border-b border-gray-700 pb-1">
                Category
              </h3>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded shadow"
              >
                <option value="all">All Categories</option>
                {Object.entries(categoryMap).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h3 className="text-xl font-bold text-blue-300 mb-3 border-b border-gray-700 pb-1">
                Price Range
              </h3>
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded shadow"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded shadow"
                />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-blue-300 mb-3 border-b border-gray-700 pb-1">
                Minimum Rating
              </h3>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded shadow"
              >
                <option value={0}>All Ratings</option>
                <option value={1}>1 star & up</option>
                <option value={2}>2 stars & up</option>
                <option value={3}>3 stars & up</option>
                <option value={4}>4 stars & up</option>
                <option value={5}>5 stars only</option>
              </select>
            </div>

            <div>
              <h3 className="text-xl font-bold text-blue-300 mb-3 border-b border-gray-700 pb-1">
                Sort by
              </h3>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded shadow"
              >
                <option value="default">Default</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="ratingAsc">Rating: Low to High</option>
                <option value="ratingDesc">Rating: High to Low</option>
              </select>
            </div>

            <div className="flex flex-col items-center gap-2 ">
              <button
                onClick={() => setOnlyNewProducts((prev) => !prev)}
                className={`w-full px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition ${
                  onlyNewProducts
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                <Sparkles size={16} /> Newest Products
              </button>

              <button
                onClick={() => setOnlyFeatured((prev) => !prev)}
                className={`w-full px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition ${
                  onlyFeatured
                    ? "bg-yellow-500 text-black"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                <Star size={16} /> Featured Products
              </button>

              <button
                onClick={() => setOnlyActive((prev) => !prev)}
                disabled={onlyBackorder}
                title={
                  onlyBackorder
                    ? "Turn off 'Backorder Products' to use this"
                    : ""
                }
                className={`w-full px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition
                ${
                  onlyActive
                    ? "bg-green-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }
                ${onlyBackorder ? "opacity-50 cursor-not-allowed" : ""}
              `}
              >
                <Package size={16} /> Available Products
              </button>

              <button
                onClick={() => setOnlyBestSeller((prev) => !prev)}
                className={`w-full px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition ${
                  onlyBestSeller
                    ? "bg-orange-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                <Flame size={16} /> Best Seller Products
              </button>

              <button
                onClick={() => setOnlyBackorder((prev) => !prev)}
                disabled={onlyActive}
                title={
                  onlyActive ? "Turn off 'Available Products' to use this" : ""
                }
                className={`w-full px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition
                ${
                  onlyBackorder
                    ? "bg-red-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }
                ${onlyActive ? "opacity-50 cursor-not-allowed" : ""}
              `}
              >
                <AlertTriangle size={16} /> Backorder Products
              </button>
            </div>
          </aside>
        )}
        {/* Main content */}
        <section className="md:w-4/5 w-full">
          {showSearchBar && (
            <div className="relative mb-8">
              <div className="flex flex-wrap items-center bg-gray-900 border border-gray-600 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                <input
                  type="text"
                  placeholder="🔍 Search Gundam, Tools, Accessories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSuggestionVisible(true)}
                  onBlur={() =>
                    setTimeout(() => setIsSuggestionVisible(false), 200)
                  }
                  className="flex-grow min-w-[180px] px-4 py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setTriggerSearch(searchTerm)}
                  title="Search"
                  className="px-3 py-2 hover:bg-gray-700 transition"
                >
                  <Search
                    size={18}
                    className="text-blue-400 hover:text-blue-500"
                  />
                </button>
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  title="Voice Search"
                  className="px-3 py-2 hover:bg-gray-700 transition"
                >
                  <Mic
                    size={18}
                    className="text-green-400 hover:text-green-500"
                  />
                </button>
                <label
                  title="Search by Image"
                  className="px-3 py-2 hover:bg-gray-700 transition cursor-pointer"
                >
                  <button
                    type="button"
                    onClick={() => setShowImageModal(true)}
                    title="Search by Image"
                    className="px-3 py-2 hover:bg-gray-700 transition flex items-center"
                  >
                    <Image
                      size={18}
                      className="text-blue-400 hover:text-blue-500"
                    />
                  </button>
                </label>
              </div>
              <ImageSearchModal
                open={showImageModal}
                onClose={() => setShowImageModal(false)}
                onSearch={handleImageSearchWrapper}
                isUploading={isUploadingImage}
              />
              {isSuggestionVisible && suggestions.length > 0 && (
                <ul className="absolute z-50 top-full left-0 right-0 bg-gray-800 border border-gray-600 rounded-b-lg shadow max-h-64 overflow-y-auto">
                  {suggestions.map((item) => (
                    <li
                      key={item._id}
                      onClick={() => {
                        setSearchTerm(item.name);
                        setTriggerSearch(item.name);
                        setSuggestions([]);
                        setIsSuggestionVisible(false);
                      }}
                      className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer"
                    >
                      {item.name}
                    </li>
                  ))}
                </ul>
              )}
      
              {/* {isUploadingImage && (
                <div className="text-center text-sm text-gray-400 mt-2 animate-pulse">
                  🖼️ Uploading image and searching...
                </div>
              )} */}

              {/* {isSearching && (
              <div className="text-center text-sm text-gray-400 mt-2 animate-pulse">
                🔍 Searching...
              </div>
            )} */}
            </div>
          )}
          <div className="relative mb-4 flex items-center">
            <h1 className="text-4xl font-bold text-blue-300 absolute left-1/2 transform -translate-x-1/2">
              Explore the Gundam Arsenal
            </h1>
            <div className="ml-auto">
              <button
                onClick={() => setShowSearchBar((prev) => !prev)}
                className="px-4 py-2 bg-gray-800 text-white rounded-md flex items-center gap-2 hover:bg-gray-700 transition"
              >
                {showSearchBar ? "Hide Search" : "Show Search"}
              </button>
            </div>
          </div>

          {isImageSearch && (
            <div className="mb-6 text-center">
              <button
                onClick={() => {
                  fetchAllProducts();
                  setIsImageSearch(false);
                  setSearchTerm("");
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-orange-400 border border-orange-500 rounded-lg hover:bg-gray-700 hover:border-orange-400 transition font-semibold shadow-sm"
              >
                <ArrowLeftCircle className="w-5 h-5 text-orange-400" />
                <span>Back to All Products</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.length === 0 ? (
              <p className="text-white">No products found.</p>
            ) : (
              currentProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8 text-sm text-white">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded ${
                      page === currentPage
                        ? "bg-blue-500 text-white"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProductPage;
