import { useState } from "react";
import { motion } from "framer-motion";
import {
  Trash,
  Flame,
  Pencil,
  CircleChevronLeft,
  Ban,
  Download,
  RotateCcw,
  PlusCircle,
  Upload,
} from "lucide-react";
import Modal from "react-modal";
import { useProductStore } from "../stores/useProductStore";
import { useLocation, useNavigate } from "react-router-dom";
import CreateProductForm from "../components/CreateProductForm";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ProductStats from "./ProductStats";
import { useNotificationStore } from "../stores/useNotificationStore";

Modal.setAppElement("#root");

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

const formatCategory = (code) => categoryMap[code.toLowerCase()] || code;

const ProductsList = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    products,
    deleteProduct,
    toggleFeaturedProduct,
    updateProduct,
    toggleActiveProduct,
  } = useProductStore();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const [filterBySold, setFilterBySold] = useState(false);
  const [filterRecent, setFilterRecent] = useState(false);
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [filterActive, setFilterActive] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { fetchNotifications } = useNotificationStore();
  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  const openEditModal = (product) => {
    setEditingProduct({ ...product });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setIsEditModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setEditingProduct((prev) => ({
      
      ...prev,
      [name]: name === "price" ? parseFloat(value) : value,
    }));
  };
  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    
    await updateProduct(editingProduct._id, editingProduct);
    await fetchNotifications();
    closeEditModal();
  };

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  
  const filteredProducts = products.filter((p) => {
    const matchCategory =
      filterCategory === "all" || p.category === filterCategory;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSold = !filterBySold || p.sold > 0;
    const matchRecent = !filterRecent || new Date(p.createdAt) >= sevenDaysAgo;
    const matchFeatured = !filterFeatured || p.isFeatured;
    const matchActive =
      filterActive === null
        ? true
        : filterActive === true
        ? p.isActive === true
        : p.isActive === false;

    return (
      matchCategory &&
      matchSearch &&
      matchSold &&
      matchRecent &&
      matchFeatured &&
      matchActive
    );
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (filterBySold) {
      return (b.sold ?? 0) - (a.sold ?? 0); // sắp xếp theo sold giảm dần
    }

    switch (sortOption) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const exportToXLSX = () => {
    const dataToExport = products.map((product) => ({
      Name: product.name,
      Price: product.price,
      Sold: product.sold ?? 0,
      Category: product.category,
      Active: product.isActive ? "Yes" : "No",
      Featured: product.featured ? "Yes" : "No",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(blob, `Products_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <motion.div
      className="bg-gray-800 border border-gray-700 shadow-lg rounded-lg overflow-hidden max-w-7xl mx-auto mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-900">
        <h2 className="text-2xl font-bold text-white">Product Management</h2>
        <div className="flex items-center gap-4">
          {location.pathname !== "/secret-dashboard" && (
            <button
              onClick={() => navigate("/secret-dashboard")}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md shadow transition"
              title="Trở về Dashboard"
            >
              <CircleChevronLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 px-6 py-4">
        <ProductStats />
        <input
          type="text"
          placeholder="Search product name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-gray-700 text-white px-3 py-2 rounded-md"
        />
        <select
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-gray-700 text-white text-center px-1 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Products</option>
          {Object.keys(categoryMap).map((key) => (
            <option key={key} value={key}>
              {categoryMap[key]}
            </option>
          ))}
        </select>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="bg-gray-700 text-white px-2 py-2 rounded-md"
        >
          <option value="default">Sort by</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
        </select>
        {/* Nút lọc sản phẩm mới */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setFilterRecent((prev) => !prev)}
          className={`px-5 py-2 rounded-md transition-all font-medium shadow ${
            filterRecent ? "bg-red-600 text-white" : "bg-gray-600 text-white"
          }`}
        >
          New
        </motion.button>
        {/* Nút lọc sản phẩm bán chạy */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setFilterBySold((prev) => !prev)}
          className={`px-5 py-2 rounded-md transition-all font-medium shadow ${
            filterBySold ? "bg-orange-400 text-black" : "bg-gray-600 text-white"
          }`}
        >
          Top
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setFilterFeatured((prev) => !prev)}
          className={`px-2 py-2 rounded-md transition-all font-medium shadow ${
            filterFeatured
              ? "bg-yellow-400 text-black"
              : "bg-gray-600 text-white"
          }`}
        >
          Featured
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={() =>
            setFilterActive((prev) =>
              prev === null ? true : prev === true ? false : null
            )
          }
          className={`px-4 py-2 rounded-md transition-all font-medium shadow ${
            filterActive === true
              ? "bg-emerald-400 text-black"
              : filterActive === false
              ? "bg-red-400 text-white"
              : "bg-gray-600 text-white"
          }`}
        >
          {filterActive === true
            ? "Available"
            : filterActive === false
            ? "Unavailable"
            : "All Status"}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => {
            setFilterActive(null);
            setFilterBySold(false);
            setFilterRecent(false);
            setFilterFeatured(false);
            setFilterCategory("all");
            setSearchTerm("");
            setSortOption("default");
            setCurrentPage(1);
          }}
          className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-400 transition-all"
        >
          <RotateCcw />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={openCreateModal}
          className="px-4 py-2 flex items-center gap-2 rounded-md bg-green-600 hover:bg-green-700 text-white transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add Product</span>
        </motion.button>

        <button
          onClick={exportToXLSX}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-all duration-300 shadow"
        >
          <Download />
        </button>
      </div>
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300">
              #
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">
              Product
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">
              Sold
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300">
              Category
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-300">
              Highlight
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-300">
              Active
            </th>

            <th className="px-6 py-3 text-center text-xs font-medium text-gray-300">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
{paginatedProducts?.map((p, index) => (
  <tr
    key={p._id}
    className="hover:bg-gray-700 cursor-pointer"
    onClick={() => navigate(`/products/${p._id}`)}
  >
    <td className="px-4 py-4 text-white text-sm">
      {(currentPage - 1) * productsPerPage + index + 1}
    </td>
    <td className="px-6 py-4 flex items-center">
      <img
        src={p.image}
        alt={p.name}
        className="w-10 h-10 object-cover rounded-full mr-4"
      />
      <span className="text-white">{p.name}</span>
    </td>
    <td className="px-6 py-4 text-gray-300">${p.price.toFixed(2)}</td>
    <td className="py-2 px-4 text-center font-semibold">
      <span
        className={`px-2 py-1 rounded ${
          p.sold >= 100
            ? "bg-green-500 text-white"
            : p.sold >= 50
            ? "bg-yellow-500 text-black"
            : p.sold > 0
            ? "bg-orange-400 text-black"
            : "bg-gray-500 text-white"
        }`}
      >
        {p.sold ?? 0}
      </span>
    </td>

    <td className="px-6 py-4 text-gray-300">
      {formatCategory(p.category)}
    </td>
    <td className="px-6 py-4 text-center">
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFeaturedProduct(p._id);
        }}
        className={`p-1 rounded-full ${
          p.isFeatured
            ? "bg-yellow-400 text-black"
            : "bg-gray-600 text-white"
        }`}
      >
        <Flame className="h-5 w-5" />
      </button>
    </td>
    <td className="px-6 py-4 text-center">
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleActiveProduct(p._id);
        }}
        className={`p-1 rounded-full ${
          p.isActive
            ? "bg-green-400 text-black"
            : "bg-gray-500 text-white"
        }`}
        title={p.isActive ? "Đang hoạt động" : "Đã tắt"}
      >
        <Ban className="h-5 w-5" />
      </button>
    </td>

    <td className="px-6 py-4 text-center space-x-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          openEditModal(p);
        }}
        className="text-blue-400 hover:text-blue-300"
      >
        <Pencil className="h-5 w-5" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteProduct(p._id);
        }}
        className="text-red-400 hover:text-red-300"
      >
        <Trash className="h-5 w-5" />
      </button>
    </td>
  </tr>
))}

        </tbody>
      </table>

      <div className="flex justify-between items-center px-6 py-4 text-sm text-gray-400">
        <span>
          Showing {paginatedProducts.length} out of {filteredProducts.length}{" "}
          entries
        </span>
        <div className="space-x-1">
          <button
            onClick={() => goToPage(currentPage - 1)}
            className="px-2 py-1 hover:underline"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
                  ? "bg-blue-400 text-white"
                  : "hover:bg-gray-600 text-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => goToPage(currentPage + 1)}
            className="px-2 py-1 hover:underline"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal chỉnh sửa sản phẩm */}
      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={closeEditModal}
        className="bg-gray-800 text-white max-w-lg w-full mx-auto mt-24 p-6 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Editing Product
        </h2>

        {editingProduct && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Product Name
              </label>
              <input
                name="name"
                value={editingProduct.name}
                onChange={handleChange}
                className="w-full border border-gray-600 rounded px-3 py-2 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <input
                name="price"
                type="number"
                value={editingProduct.price}
                onChange={handleChange}
                className="w-full border border-gray-600 rounded px-3 py-2 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={editingProduct.description}
                onChange={handleChange}
                className="w-full border border-gray-600 rounded px-3 py-2 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Image</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  id="editImage"
                  className="hidden"
                  accept="image/*"
                  onChange={handleEditImageChange}
                />
                <label
                  htmlFor="editImage"
                  className="cursor-pointer flex items-center bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Image
                </label>
                {editingProduct.image && (
                  <img
                    src={editingProduct.image}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                name="category"
                value={editingProduct.category}
                onChange={handleChange}
                className="w-full border border-gray-600 rounded px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring focus:ring-blue-400"
              >
                {Object.keys(categoryMap).map((key) => (
                  <option key={key} value={key}>
                    {categoryMap[key]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                onClick={closeEditModal}
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md transition duration-200"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </Modal>
      {/* show Create Product Form */}
      <Modal
        isOpen={isCreateModalOpen}
        onRequestClose={closeCreateModal}
        className=" text-white max-w-2xl mx-auto mt-24 p-6 rounded-lg shadow-lg outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <CreateProductForm onClose={closeCreateModal} />
      </Modal>
    </motion.div>
  );
};

export default ProductsList;
