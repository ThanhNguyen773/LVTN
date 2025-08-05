// import { useEffect, useState } from "react";
// import { useProductStore } from "../stores/useProductStore";
// import { useProductReviewStore } from "../stores/useProductReviewStore";
// import { motion } from "framer-motion";
// import StarRating from "./StarRating";

// const ReviewList = () => {
//   const { products, fetchAllProducts } = useProductStore();
//   const {
//     productReviews,
//     fetchAllReviewsByProductId,
//     toggleReviewVisibility,
//     loading,
//     replyToReview,
//     editReplyToReview,
//     deleteReply,
//   } = useProductReviewStore();
//   const [selectedProductId, setSelectedProductId] = useState("");
//   const [filterStatus, setFilterStatus] = useState("all"); // all | visible | hidden
//   const [sortOrder, setSortOrder] = useState("newest"); // newest | oldest
//   const [searchKeyword, setSearchKeyword] = useState("");
//   const [replyInputs, setReplyInputs] = useState({}); // { reviewId: "content" }
//   const [editingReplyId, setEditingReplyId] = useState(null); // reviewId đang chỉnh

//   const getAvatarUrl = (user) => {
//     if (!user)
//       return "https://res.cloudinary.com/dhd7fwafy/image/upload/v1752225767/sQxW2GrO_400x400_w9afhp.png";
//     if (typeof user.avatar === "string") return user.avatar;
//     if (typeof user.avatar === "object" && user.avatar?.url)
//       return user.avatar.url;
//     return "https://res.cloudinary.com/dhd7fwafy/image/upload/v1752225767/sQxW2GrO_400x400_w9afhp.png";
//   };

//   useEffect(() => {
//     fetchAllProducts();
//   }, []);

//   useEffect(() => {
//     if (selectedProductId) {
//       fetchAllReviewsByProductId(selectedProductId);
//     }
//   }, [selectedProductId]);

//   const handleToggle = (reviewId, isHidden) => {
//     toggleReviewVisibility(selectedProductId, reviewId, !isHidden);
//   };
//   const handleDeleteReply = async (reviewId) => {
//     const confirmDelete = window.confirm("Bạn có chắc muốn xoá phản hồi này?");
//     if (!confirmDelete) return;

//     await deleteReply(selectedProductId, reviewId);
//     await fetchAllReviewsByProductId(selectedProductId);
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };

//   // Lọc và sắp xếp
//   let reviews = productReviews[selectedProductId] || [];

//   if (filterStatus === "visible") {
//     reviews = reviews.filter((r) => !r.isHidden);
//   } else if (filterStatus === "hidden") {
//     reviews = reviews.filter((r) => r.isHidden);
//   }

//   if (sortOrder === "newest") {
//     reviews.sort(
//       (a, b) =>
//         new Date(b.updatedAt || b.createdAt) -
//         new Date(a.updatedAt || a.createdAt)
//     );
//   } else {
//     reviews.sort(
//       (a, b) =>
//         new Date(a.updatedAt || a.createdAt) -
//         new Date(b.updatedAt || b.createdAt)
//     );
//   }
//   if (searchKeyword.trim() !== "") {
//     const keyword = searchKeyword.toLowerCase();
//     reviews = reviews.filter((review) => {
//       const commentMatch = review.comment?.toLowerCase().includes(keyword);
//       const userMatch = review.user?.name?.toLowerCase().includes(keyword);
//       return commentMatch || userMatch;
//     });
//   }

//   return (
//     <motion.div
//       className="bg-gray-800 shadow-lg rounded-lg border border-gray-700 overflow-hidden max-w-6xl mx-auto mt-8"
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.8 }}
//     >
//       <div className="p-6 bg-gray-900 border border-gray-700 text-white rounded-lg shadow-lg space-y-6">
//         <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2">
//           Review Management
//         </h2>

//         {/* Select Product */}
//         <div>
//           <label
//             htmlFor="product-select"
//             className="block mb-1 text-sm text-gray-300"
//           >
//             Select a product to view reviews:
//           </label>
//           <select
//             id="product-select"
//             value={selectedProductId}
//             onChange={(e) => setSelectedProductId(e.target.value)}
//             className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded w-full"
//           >
//             <option value="">-- Choose a product --</option>
//             {products.map((product) => (
//               <option key={product._id} value={product._id}>
//                 {product.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Filter & Sort Options */}
//         {selectedProductId && (
//           <div className="space-y-4">
//             {/* Filter & Sort */}
//             <div className="flex flex-col sm:flex-row gap-4">
//               <div className="flex-1">
//                 <label className="block text-sm text-gray-300 mb-1">
//                   Filter by status:
//                 </label>
//                 <select
//                   value={filterStatus}
//                   onChange={(e) => setFilterStatus(e.target.value)}
//                   className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded w-full"
//                 >
//                   <option value="all">All reviews</option>
//                   <option value="visible">Visible only</option>
//                   <option value="hidden">Hidden only</option>
//                 </select>
//               </div>
//               <div className="flex-1">
//                 <label className="block text-sm text-gray-300 mb-1">
//                   Sort by:
//                 </label>
//                 <select
//                   value={sortOrder}
//                   onChange={(e) => setSortOrder(e.target.value)}
//                   className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded w-full"
//                 >
//                   <option value="newest">Newest first</option>
//                   <option value="oldest">Oldest first</option>
//                 </select>
//               </div>
//             </div>

//             {/* Search Bar */}
//             <div>
//               <label className="block text-sm text-gray-300 mb-1">
//                 Search reviews:
//               </label>
//               <input
//                 type="text"
//                 placeholder="Enter keyword or user name..."
//                 value={searchKeyword}
//                 onChange={(e) => setSearchKeyword(e.target.value)}
//                 className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded w-full"
//               />
//             </div>
//           </div>
//         )}

//         {/* Review List */}
//         {loading && <p className="text-gray-400 italic">Loading reviews...</p>}

//         {!loading && selectedProductId && (
//           <>
//             {reviews.length === 0 ? (
//               <p className="text-gray-500 italic">
//                 No reviews available with selected filters.
//               </p>
//             ) : (
//               <ul className="space-y-4">
//                 {reviews.map((review) => {
//                   const isEdited =
//                     review.updatedAt && review.updatedAt !== review.createdAt;
//                   const displayDate = isEdited
//                     ? formatDate(review.updatedAt)
//                     : formatDate(review.createdAt);
//                   const dateLabel = isEdited ? "Last edited on" : "Reviewed on";

//                   return (
//                     <li
//                       key={review._id}
//                       className={`p-4 rounded-lg shadow-sm border ${
//                         review.isHidden
//                           ? "border-red-500 bg-gray-800/70"
//                           : "border-gray-700 bg-gray-800"
//                       }`}
//                     >
//                       <div className="flex justify-between items-start mb-2 gap-4">
//                         <div className="flex items-center gap-3">
//                           <img
//                             src={getAvatarUrl(review.user)}
//                             alt="Avatar"
//                             className="w-10 h-10 rounded-full object-cover border border-gray-600"
//                           />
//                           <div>
//                             <p className="font-semibold text-lg">
//                               {review.user?.name || "Anonymous user"}
//                             </p>
//                           </div>
//                         </div>

//                         <button
//                           onClick={() =>
//                             handleToggle(review._id, review.isHidden)
//                           }
//                           className={`text-sm font-medium ${
//                             review.isHidden ? "text-green-400" : "text-red-400"
//                           } hover:underline`}
//                         >
//                           {review.isHidden ? "Show review" : "Hide review"}
//                         </button>
//                       </div>
//                       {/* <p className="text-yellow-400">
//                         ⭐ {review.rating} stars
//                       </p> */}
//                       <StarRating rating={review.rating} size={16} />
//                       <p className="text-gray-300 mb-1">{review.comment}</p>
//                       {review.reply ? (
//                         <div className="mt-2 bg-gray-700/40 p-3 rounded text-sm text-gray-200">
//                           <p className="mb-1">
//                             <span className="text-green-400 font-medium">
//                               📝 Your reply:
//                             </span>{" "}
//                             {review.reply.content}
//                           </p>

//                           {editingReplyId === review._id ? (
//                             <div className="space-y-2">
//                               <textarea
//                                 className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white"
//                                 rows={2}
//                                 value={replyInputs[review._id] || ""}
//                                 onChange={(e) =>
//                                   setReplyInputs({
//                                     ...replyInputs,
//                                     [review._id]: e.target.value,
//                                   })
//                                 }
//                               />
//                               <div className="flex gap-2">
//                                 <button
//                                   onClick={async () => {
//                                     await editReplyToReview(
//                                       selectedProductId,
//                                       review._id,
//                                       replyInputs[review._id]
//                                     );
//                                     await fetchAllReviewsByProductId(
//                                       selectedProductId
//                                     );
//                                     setEditingReplyId(null);
//                                   }}
//                                   className="text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
//                                 >
//                                   Save
//                                 </button>

//                                 <button
//                                   onClick={() => {
//                                     setEditingReplyId(null);
//                                     setReplyInputs({
//                                       ...replyInputs,
//                                       [review._id]: review.reply?.content || "",
//                                     });
//                                   }}
//                                   className="text-sm px-3 py-1 rounded bg-gray-500 hover:bg-gray-600 text-white"
//                                 >
//                                   Cancel
//                                 </button>
//                               </div>
//                             </div>
//                           ) : (
//                             <div className="flex gap-4 mt-2">
//                               <button
//                                 onClick={() => {
//                                   setEditingReplyId(review._id);
//                                   setReplyInputs({
//                                     ...replyInputs,
//                                     [review._id]: review.reply?.content || "",
//                                   });
//                                 }}
//                                 className="text-sm text-blue-400 hover:underline"
//                               >
//                                 ✏️ Edit reply
//                               </button>

//                               <button
//                                 onClick={() => handleDeleteReply(review._id)}
//                                 className="text-sm text-red-400 hover:underline"
//                               >
//                                 🗑️ Delete reply
//                               </button>
//                             </div>
//                           )}
//                         </div>
//                       ) : (
//                         <div className="mt-2 space-y-2">
//                           <textarea
//                             className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
//                             placeholder="Write a reply..."
//                             rows={2}
//                             value={replyInputs[review._id] || ""}
//                             onChange={(e) =>
//                               setReplyInputs({
//                                 ...replyInputs,
//                                 [review._id]: e.target.value,
//                               })
//                             }
//                           />
//                           <button
//                             onClick={() => {
//                               replyToReview(
//                                 selectedProductId,
//                                 review._id,
//                                 replyInputs[review._id]
//                               );
//                               setReplyInputs({
//                                 ...replyInputs,
//                                 [review._id]: "",
//                               });
//                             }}
//                             className="text-sm px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white"
//                           >
//                             💬 Reply
//                           </button>
//                         </div>
//                       )}

//                       <p className="text-sm text-gray-400 italic">
//                         🕒 {dateLabel}: {displayDate}
//                       </p>
//                       {review.isHidden && (
//                         <p className="text-sm italic text-red-400">
//                           ⛔ This review is currently hidden
//                         </p>
//                       )}
//                     </li>
//                   );
//                 })}
//               </ul>
//             )}
//           </>
//         )}
//       </div>
//     </motion.div>
//   );
// };

// export default ReviewList;

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useProductStore } from "../stores/useProductStore";
import { useProductReviewStore } from "../stores/useProductReviewStore";
import { motion } from "framer-motion";
import StarRating from "./StarRating";

// debounce hook
const useDebouncedValue = (value, delay = 200) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const ReviewList = () => {
  const { products = [], fetchAllProducts } = useProductStore();
  const {
    productReviews,
    fetchAllReviewsByProductId,
    toggleReviewVisibility,
    loading,
    replyToReview,
    editReplyToReview,
    deleteReply,
  } = useProductReviewStore();

  const [selectedProductId, setSelectedProductId] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [replyInputs, setReplyInputs] = useState({});
  const [editingReplyId, setEditingReplyId] = useState(null);

  // product combobox states
  const [productSearch, setProductSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const debouncedSearch = useDebouncedValue(productSearch, 150);

  const filteredProducts = useMemo(() => {
    if (!debouncedSearch.trim()) return [];
    const kw = debouncedSearch.toLowerCase();
    return products
      .filter((p) => p.name?.toLowerCase().includes(kw))
      .slice(0, 50);
  }, [products, debouncedSearch]);

  // reset highlight when list changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredProducts]);

  // fetch products once
  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  // fetch reviews when selection changes
  useEffect(() => {
    if (selectedProductId) {
      fetchAllReviewsByProductId(selectedProductId);
    }
  }, [selectedProductId, fetchAllReviewsByProductId]);

  // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // handle selection
  const handleSelectProduct = (productId) => {
    setSelectedProductId(productId);
    setShowDropdown(false);
    setProductSearch("");
  };

  const handleKeyDown = (e) => {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, filteredProducts.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const picked = filteredProducts[highlightedIndex];
      if (picked) handleSelectProduct(picked._id);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const getAvatarUrl = (user) => {
    if (!user)
      return "https://res.cloudinary.com/dhd7fwafy/image/upload/v1752225767/sQxW2GrO_400x400_w9afhp.png";
    if (typeof user.avatar === "string") return user.avatar;
    if (typeof user.avatar === "object" && user.avatar?.url)
      return user.avatar.url;
    return "https://res.cloudinary.com/dhd7fwafy/image/upload/v1752225767/sQxW2GrO_400x400_w9afhp.png";
  };

  const handleToggle = (reviewId, isHidden) => {
    toggleReviewVisibility(selectedProductId, reviewId, !isHidden);
  };
  const handleDeleteReply = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this reply?")) return;
    await deleteReply(selectedProductId, reviewId);
    await fetchAllReviewsByProductId(selectedProductId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // review list processing
  let reviews = (productReviews[selectedProductId] || []).slice();

  if (filterStatus === "visible") {
    reviews = reviews.filter((r) => !r.isHidden);
  } else if (filterStatus === "hidden") {
    reviews = reviews.filter((r) => r.isHidden);
  }

  if (sortOrder === "newest") {
    reviews.sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt) -
        new Date(a.updatedAt || a.createdAt)
    );
  } else {
    reviews.sort(
      (a, b) =>
        new Date(a.updatedAt || a.createdAt) -
        new Date(b.updatedAt || b.createdAt)
    );
  }

  if (searchKeyword.trim()) {
    const keyword = searchKeyword.toLowerCase();
    reviews = reviews.filter((review) => {
      const commentMatch = review.comment
        ?.toLowerCase()
        .includes(keyword);
      const userMatch = review.user?.name
        ?.toLowerCase()
        .includes(keyword);
      return commentMatch || userMatch;
    });
  }

  // compute dropdown position
  const [dropdownStyle, setDropdownStyle] = useState({});
  const updateDropdownPosition = useCallback(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "absolute",
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
        zIndex: 9999,
      });
    }
  }, []);

  useEffect(() => {
    if (showDropdown) {
      updateDropdownPosition();
    }
  }, [showDropdown, filteredProducts, updateDropdownPosition]);

  useEffect(() => {
    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);
    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [updateDropdownPosition]);

  // display name for selected product
  const selectedProductName = useMemo(() => {
    return products.find((p) => p._id === selectedProductId)?.name || "";
  }, [products, selectedProductId]);

  return (
    <motion.div
      className="bg-gray-800 shadow-lg rounded-lg border border-gray-700 overflow-hidden max-w-6xl mx-auto mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="p-6 bg-gray-900 border border-gray-700 text-white rounded-lg shadow-lg space-y-6">
        <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2">
          Review Management
        </h2>

        {/* Product combobox with search */}
        <div className="relative">
          <label className="block mb-1 text-sm text-gray-300">
            Select a product to view reviews:
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                placeholder={
                  selectedProductId
                    ? selectedProductName || "Search product..."
                    : "Type to search product..."
                }
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => {
                  if (productSearch.trim()) setShowDropdown(true);
                }}
                onKeyDown={handleKeyDown}
                className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded w-full"
                aria-autocomplete="list"
                aria-expanded={showDropdown}
                aria-haspopup="listbox"
              />
            </div>
            {selectedProductId && (
              <button
                onClick={() => {
                  setSelectedProductId("");
                }}
                className="px-3 py-2 bg-gray-700 rounded text-sm hover:bg-gray-600"
                aria-label="Clear selected product"
              >
                ✕
              </button>
            )}
          </div>
          {!selectedProductId && !productSearch && (
            <p className="text-xs text-gray-400 mt-1">
              Type product name to search; full list is hidden for performance.
            </p>
          )}
        </div>

        {/* Portal dropdown */}
        {showDropdown &&
          createPortal(
            <div
              ref={dropdownRef}
              style={dropdownStyle}
              className="bg-gray-900 border border-gray-700 rounded shadow-lg max-h-60 overflow-auto"
              role="listbox"
              aria-label="Product options"
            >
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, idx) => (
                  <div
                    key={product._id}
                    role="option"
                    aria-selected={highlightedIndex === idx}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectProduct(product._id)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`px-3 py-2 cursor-pointer text-sm ${
                      highlightedIndex === idx
                        ? "bg-gray-700 text-white"
                        : "text-gray-300"
                    }`}
                  >
                    {product.name}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  {debouncedSearch.trim()
                    ? `No matching products for "${debouncedSearch}"`
                    : "Start typing to search products..."}
                </div>
              )}
            </div>,
            document.body
          )}

        {/* Filter & Sort Options */}
        {selectedProductId && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm text-gray-300 mb-1">
                  Filter by status:
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded w-full"
                >
                  <option value="all">All reviews</option>
                  <option value="visible">Visible only</option>
                  <option value="hidden">Hidden only</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-300 mb-1">
                  Sort by:
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded w-full"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Search reviews:
              </label>
              <input
                type="text"
                placeholder="Enter keyword or user name..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded w-full"
              />
            </div>
          </div>
        )}

        {/* The rest of review list remains unchanged */}
        {loading && <p className="text-gray-400 italic">Loading reviews...</p>}

        {!loading && selectedProductId && (
          <>
            {reviews.length === 0 ? (
              <p className="text-gray-500 italic">
                No reviews available with selected filters.
              </p>
            ) : (
              <ul className="space-y-4">
                {reviews.map((review) => {
                  const isEdited =
                    review.updatedAt && review.updatedAt !== review.createdAt;
                  const displayDate = isEdited
                    ? formatDate(review.updatedAt)
                    : formatDate(review.createdAt);
                  const dateLabel = isEdited
                    ? "Last edited on"
                    : "Reviewed on";

                  return (
                    <li
                      key={review._id}
                      className={`p-4 rounded-lg shadow-sm border ${
                        review.isHidden
                          ? "border-red-500 bg-gray-800/70"
                          : "border-gray-700 bg-gray-800"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2 gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getAvatarUrl(review.user)}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full object-cover border border-gray-600"
                          />
                          <div>
                            <p className="font-semibold text-lg">
                              {review.user?.name || "Anonymous user"}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            handleToggle(review._id, review.isHidden)
                          }
                          className={`text-sm font-medium ${
                            review.isHidden
                              ? "text-green-400"
                              : "text-red-400"
                          } hover:underline`}
                        >
                          {review.isHidden ? "Show review" : "Hide review"}
                        </button>
                      </div>

                      <StarRating rating={review.rating} size={16} />
                      <p className="text-gray-300 mb-1">{review.comment}</p>
                      {review.reply ? (
                        <div className="mt-2 bg-gray-700/40 p-3 rounded text-sm text-gray-200">
                          <p className="mb-1">
                            <span className="text-green-400 font-medium">
                              📝 Your reply:
                            </span>{" "}
                            {review.reply.content}
                          </p>

                          {editingReplyId === review._id ? (
                            <div className="space-y-2">
                              <textarea
                                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white"
                                rows={2}
                                value={replyInputs[review._id] || ""}
                                onChange={(e) =>
                                  setReplyInputs({
                                    ...replyInputs,
                                    [review._id]: e.target.value,
                                  })
                                }
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={async () => {
                                    await editReplyToReview(
                                      selectedProductId,
                                      review._id,
                                      replyInputs[review._id]
                                    );
                                    await fetchAllReviewsByProductId(
                                      selectedProductId
                                    );
                                    setEditingReplyId(null);
                                  }}
                                  className="text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  Save
                                </button>

                                <button
                                  onClick={() => {
                                    setEditingReplyId(null);
                                    setReplyInputs({
                                      ...replyInputs,
                                      [review._id]:
                                        review.reply?.content || "",
                                    });
                                  }}
                                  className="text-sm px-3 py-1 rounded bg-gray-500 hover:bg-gray-600 text-white"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-4 mt-2">
                              <button
                                onClick={() => {
                                  setEditingReplyId(review._id);
                                  setReplyInputs({
                                    ...replyInputs,
                                    [review._id]:
                                      review.reply?.content || "",
                                  });
                                }}
                                className="text-sm text-blue-400 hover:underline"
                              >
                                ✏️ Edit reply
                              </button>

                              <button
                                onClick={() => handleDeleteReply(review._id)}
                                className="text-sm text-red-400 hover:underline"
                              >
                                🗑️ Delete reply
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mt-2 space-y-2">
                          <textarea
                            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                            placeholder="Write a reply..."
                            rows={2}
                            value={replyInputs[review._id] || ""}
                            onChange={(e) =>
                              setReplyInputs({
                                ...replyInputs,
                                [review._id]: e.target.value,
                              })
                            }
                          />
                          <button
                            onClick={() => {
                              replyToReview(
                                selectedProductId,
                                review._id,
                                replyInputs[review._id]
                              );
                              setReplyInputs({
                                ...replyInputs,
                                [review._id]: "",
                              });
                            }}
                            className="text-sm px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white"
                          >
                            💬 Reply
                          </button>
                        </div>
                      )}

                      <p className="text-sm text-gray-400 italic">
                        🕒 {dateLabel}: {displayDate}
                      </p>
                      {review.isHidden && (
                        <p className="text-sm italic text-red-400">
                          ⛔ This review is currently hidden
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ReviewList;
