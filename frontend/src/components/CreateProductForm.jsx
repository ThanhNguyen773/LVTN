import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Loader, PlusCircle, Upload, X } from "lucide-react";
import { useProductStore } from "../stores/useProductStore";
import { useNotificationStore } from "../stores/useNotificationStore";

const categories = ["hg", "rg", "mg", "pg", "sd", "tools", "decal", "other"];

const fileToDataURL = (file) =>
  new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") res(reader.result);
      else rej(new Error("Failed to read file"));
    };
    reader.onerror = () => rej(new Error("File reading error"));
    reader.readAsDataURL(file);
  });

const CreateProductForm = () => {
  const [newProduct, setNewProduct] = useState({
    name: "Ver - Name",
    description: `Product Name: 
Brand: Bandai
Version: 
Scale:
Age: >10
Category: Model Kit`,
    price: "",
    category: "",
    countInStock: "",
    image: "",
    modelUrl: "",
  });

  const { createProduct, loading } = useProductStore();
  const { fetchNotifications } = useNotificationStore();
  const [imageDragActive, setImageDragActive] = useState(false);
  const [modelDragActive, setModelDragActive] = useState(false);
  const [modelError, setModelError] = useState(null);
  const imageInputRef = useRef(null);
  const modelInputRef = useRef(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProduct(newProduct);
      await fetchNotifications();
      setNewProduct({
        name: "",
        description: "",
        price: "",
        category: "",
        image: "",
        modelUrl: "",
        countInStock: "",
      });
      setModelError(null);
    } catch (error) {
      console.error("Error creating product", error);
    }
  };

  const onImageDrop = useCallback(async (e) => {
    e.preventDefault();
    setImageDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      try {
        const dataUrl = await fileToDataURL(file);
        setNewProduct((prev) => ({ ...prev, image: dataUrl }));
      } catch {
        console.warn("Failed to read image");
      }
    }
  }, []);

  const onModelDrop = useCallback(async (e) => {
    e.preventDefault();
    setModelDragActive(false);
    setModelError(null);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.name.toLowerCase().endsWith(".glb")) {
        try {
          const dataUrl = await fileToDataURL(file);
          setNewProduct((prev) => ({ ...prev, modelUrl: dataUrl }));
        } catch {
          setModelError("Failed to load model file.");
        }
      } else {
        setModelError("Please drop a valid .glb 3D model file.");
      }
    }
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      try {
        const dataUrl = await fileToDataURL(file);
        setNewProduct((prev) => ({ ...prev, image: dataUrl }));
      } catch {
        console.warn("Image read error");
      }
    }
  };

  const handleModelChange = async (e) => {
    setModelError(null);
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.toLowerCase().endsWith(".glb")) {
        try {
          const dataUrl = await fileToDataURL(file);
          setNewProduct((prev) => ({ ...prev, modelUrl: dataUrl }));
        } catch {
          setModelError("Failed to load model file.");
        }
      } else {
        setModelError("Please upload a valid .glb 3D model file.");
      }
    }
  };

  const clearImage = () => {
    setNewProduct((prev) => ({ ...prev, image: "" }));
    if (imageInputRef.current) imageInputRef.current.value = "";
  };
  const clearModel = () => {
    setNewProduct((prev) => ({ ...prev, modelUrl: "" }));
    setModelError(null);
    if (modelInputRef.current) modelInputRef.current.value = "";
  };

  const preventDefault = (e) => e.preventDefault();

  return (
    <motion.div
      className="bg-gray-900 shadow-xl rounded-2xl p-10 mb-10 max-w-xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-3xl font-bold mb-8 text-center text-blue-300">
        Create New Product
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5 text-sm text-white">
        <div>
          <label
            htmlFor="name"
            className="block mb-1 font-medium text-gray-300"
          >
            Product Name
          </label>
          <input
            type="text"
            id="name"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
            className="w-full rounded-lg bg-gray-800 border border-gray-600 px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-300"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={newProduct.description}
            onChange={(e) =>
              setNewProduct({ ...newProduct, description: e.target.value })
            }
            rows={3}
            className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="price"
              className="block mb-1 font-medium text-gray-300"
            >
              Price
            </label>
            <input
              type="number"
              id="price"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: e.target.value })
              }
              className="w-full rounded-lg bg-gray-800 border border-gray-600 px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block mb-1 font-medium text-gray-300"
            >
              Category
            </label>
            <select
              id="category"
              value={newProduct.category}
              onChange={(e) =>
                setNewProduct({ ...newProduct, category: e.target.value })
              }
              className="w-full rounded-lg bg-gray-800 border border-gray-600 px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            >
              <option value="">-- Select Category --</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

{/* Image Upload Drag & Drop */}
<div>
  <label className="block mb-1 font-medium text-gray-300">
    Product Image
  </label>
  <div
    onDragOver={preventDefault}
    onDragEnter={(e) => {
      preventDefault(e);
      setImageDragActive(true);
    }}
    onDragLeave={() => setImageDragActive(false)}
    onDrop={onImageDrop}
    className={`relative border-2 rounded-lg p-4 flex items-center justify-center gap-4 flex-col ${
      imageDragActive
        ? "border-blue-400 bg-gray-800/70"
        : "border-dashed border-gray-600"
    } cursor-pointer transition`}
  >
    <input
      type="file"
      id="image"
      accept="image/*"
      onChange={handleImageChange}
      ref={imageInputRef}
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      aria-label="Upload product image"
    />
{!newProduct.image ? (
  <div className="flex flex-col items-center text-gray-300">
    <Upload className="w-6 h-6 mb-1" />
    <div className="text-sm">
      Drag & drop image here, or click to select
    </div>
  </div>
) : (
  <div className="relative w-20 h-20">
    <img
      src={newProduct.image}
      alt="Preview"
      className="w-full h-full object-cover rounded"
    />
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        clearImage();
      }}
      className="absolute top-0 right-0 bg-gray-800 p-1 rounded-full hover:bg-gray-700"
      aria-label="Remove image"
    >
      <X className="w-4 h-4" />
    </button>
  </div>
)}

  </div>
</div>


{/* Model Upload Drag & Drop */}
<div>
  <label className="block mb-1 font-medium text-gray-300">
    3D Model (.glb)
  </label>
  <div
    onDragOver={preventDefault}
    onDragEnter={(e) => {
      preventDefault(e);
      setModelDragActive(true);
    }}
    onDragLeave={() => setModelDragActive(false)}
    onDrop={onModelDrop}
    className={`relative border-2 rounded-lg p-4 flex items-center justify-center gap-4 flex-col ${
      modelDragActive
        ? "border-blue-400 bg-gray-800/70"
        : "border-dashed border-gray-600"
    } cursor-pointer transition`}
  >
    <input
      type="file"
      id="model"
      accept=".glb"
      onChange={handleModelChange}
      ref={modelInputRef}
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      aria-label="Upload 3D model"
    />

    {!newProduct.modelUrl ? (
      <div className="flex flex-col items-center text-gray-300">
        <Upload className="w-6 h-6 mb-1" />
        <div className="text-sm text-center">
          Drag & drop .glb file here, or click to select
        </div>
      </div>
    ) : (
      <div className="relative w-full flex items-center justify-center">
        {/* Vì .glb không thể preview trực tiếp như ảnh, bạn có thể hiển thị biểu tượng hoặc text */}
        <div className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-2">
          <div className="flex flex-col">
            <span className="text-green-400 text-sm">Model selected</span>
            <span className="text-xs truncate">{/* có thể hiển thị tên nếu lưu */}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            clearModel();
          }}
          className="absolute top-0 right-0 bg-gray-800 p-1 rounded-full hover:bg-gray-700"
          aria-label="Remove model"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )}
  </div>
  {modelError && (
    <p className="text-sm text-red-400 mt-1">{modelError}</p>
  )}
</div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold flex justify-center items-center transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <PlusCircle className="w-5 h-5 mr-2" />
              Create Product
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default CreateProductForm;
