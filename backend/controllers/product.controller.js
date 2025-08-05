import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";
import Review from "../models/review.model.js";

import axios from "axios";
import {
  notifyAdminsAndStaffs,
  notifyAllUsers,
} from "../utils/notification.util.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json({ products });
  } catch (error) {
    console.log("Error in getAllProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get("featured_products");

    if (featuredProducts) {
      return res.json(JSON.parse(featuredProducts));
    }

    featuredProducts = await Product.find({
      isFeatured: true,
      isActive: true,
    }).lean();

    if (!featuredProducts) {
      return res.status(404).json({ message: "No featured products found" });
    }

    await redis.set("featured_products", JSON.stringify(featuredProducts));
    res.json(featuredProducts);
  } catch (error) {
    console.log("Error in getFeaturedProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category, modelUrl } = req.body;

    let cloudinaryResponse = null;
    let modelUpload = null;

    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }

    if (modelUrl && modelUrl.startsWith("data:")) {
      modelUpload = await cloudinary.uploader.upload(modelUrl, {
        folder: "models",
        resource_type: "raw",
        public_id: `${name.replace(/\s+/g, "_")}_${Date.now()}`,
      });
    }

    let detectedLabel = "";
    if (cloudinaryResponse?.secure_url) {
      const classifyResponse = await axios.post(
        "https://api-inference.huggingface.co/models/google/vit-base-patch16-224",
        { inputs: cloudinaryResponse.secure_url },
        {
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      detectedLabel = classifyResponse.data?.[0]?.label || "";
      console.log("🏷️ Label phân loại:", detectedLabel);
    }

    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse?.secure_url || "",
      category,
      modelUrl: modelUpload?.secure_url || modelUrl || "",
      detectedLabel,
    });
    // Gửi thông báo cho Admin và Staff
    await notifyAdminsAndStaffs(
      `🆕 Product "${product.name}" has been created`,
      "system"
    );

    // Gửi thông báo đến tất cả user với link sản phẩm cụ thể
    await notifyAllUsers(
      `🆕 Introducing our latest model: "${product.name}" - Limited stock, grab yours now!`,
      "promotion",
      `/products/${product._id}` // ✅ sửa đúng ID ở đây
    );

    res.status(201).json(product);
  } catch (error) {
    console.log("Error in createProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();

    if (!product) {
      return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    }

    const reviews = await Review.find({ product: product._id });
    const ratingCount = reviews.length;
    const averageRating = ratingCount
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount
      : 0;

    res.status(200).json({
      ...product,
      averageRating: Number(averageRating.toFixed(1)),
      ratingCount,
      reviews,
    });
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm theo ID:", error);
    res.status(500).json({ error: "Không thể lấy sản phẩm" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
        console.log("Deleted image from Cloudinary");
      } catch (error) {
        console.log("Error deleting image from Cloudinary", error);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    await updateFeaturedProductsCache();
    await notifyAdminsAndStaffs(
      `🗑️ Product "${product.name}" has been deleted`,
      "system"
    );
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error in deleteProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      { $match: { isActive: true } },
      { $sort: { averageRating: -1, ratingCount: -1 } },
      { $limit: 20 },
      { $sample: { size: 4 } },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
          category: 1,
          averageRating: 1,
          ratingCount: 1,
          sold: 1,
          isActive: 1,
        },
      },
    ]);

    res.json(products);
  } catch (error) {
    console.error("🔥 Error in getRecommendedProducts:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.find({ category });
    res.json({ products });
  } catch (error) {
    console.log("Error in getProductsByCategory controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, image, category, modelUrl } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (image && image !== product.image) {
      if (product.image) {
        const publicId = product.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`products/${publicId}`);
      }

      const cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });

      product.image = cloudinaryResponse.secure_url;
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.modelUrl = modelUrl || product.modelUrl;

    const updatedProduct = await product.save();

    await notifyAdminsAndStaffs(
      `✏️ Product "${updatedProduct.name}" has been updated`,
      "system"
    );

    // (Optional) Gửi thông báo promotion nếu bạn muốn khách hàng thấy sản phẩm cập nhật
    await notifyAllUsers(
      `🔄 Our product "${updatedProduct.name}" just got even better - check it out!`,
      "promotion",
      `/products/${updatedProduct._id}`
    );
    res.json(updatedProduct);
  } catch (error) {
    console.log("Error in updateProduct:", error.message);
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật sản phẩm", error: error.message });
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      await updateFeaturedProductsCache();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in toggleFeaturedProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

async function updateFeaturedProductsCache() {
  try {
    const featuredProducts = await Product.find({
      isFeatured: true,
      isActive: true,
    }).lean();
    await redis.set("featured_products", JSON.stringify(featuredProducts));
  } catch (error) {
    console.log("Error in update cache function:", error.message);
  }
}

export const searchProductsByImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Cần gửi ảnh để tìm kiếm" });
    }

    const imageBuffer = req.file.buffer;

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/google/vit-base-patch16-224",
      imageBuffer,
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
          "Content-Type": "application/octet-stream",
        },
      }
    );

    const label = response.data?.[0]?.label;
    if (!label) {
      return res.status(400).json({ message: "Không thể phân loại ảnh" });
    }

    console.log("🏷️ Label dự đoán:", label);

    const matchedProducts = await Product.find({
      $or: [
        { category: { $regex: new RegExp(label, "i") } },
        { detectedLabel: { $regex: new RegExp(label, "i") } },
      ],
    });

    res.json({ results: matchedProducts, label });
  } catch (error) {
    console.error("❌ Lỗi khi phân loại ảnh:", error.message);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

export const toggleActiveProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.isActive = !product.isActive;
    const updatedProduct = await product.save();

    await updateFeaturedProductsCache();
    await notifyAdminsAndStaffs(
      `🚦 Product "${updatedProduct.name}" has been ${updatedProduct.isActive ? "enabled" : "disabled"}`,
      "system"
    );

    // ✅ (Optional) Gửi cho tất cả user nếu sản phẩm được bật lại
    if (updatedProduct.isActive) {
      await notifyAllUsers(
        `🚨 "${updatedProduct.name}" is back in stock! Check it out now.`,
        "promotion",
        `/products/${updatedProduct._id}`
      );
    }
    res.json({
      message: `Product has been ${product.isActive ? "enabled" : "disabled"}`,
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error in toggleActiveProduct controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
