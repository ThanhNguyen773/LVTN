import Category from "../models/category.model.js";
import cloudinary from "../lib/cloudinary.js";
import slugify from "slugify";

// [GET] /categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json({ categories });
  } catch (error) {
    console.error("Error in getAllCategories:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// [GET] /categories/:slug
export const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// [POST] /categories
export const createCategory = async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    let finalImageUrl = imageUrl || "";

    
    if (imageUrl && imageUrl.startsWith("data:image")) {
        console.log("Uploading base64 image, length:", imageUrl.length);
        console.log("Base64 preview:", imageUrl.slice(0, 100));
      const uploaded = await cloudinary.uploader.upload(imageUrl, {
        folder: "categories",
      });
      finalImageUrl = uploaded.secure_url;
    }

    const slug = slugify(name, { lower: true });

    const category = await Category.create({
      name,
      slug,
      description,
      imageUrl: finalImageUrl,
    });

    res.status(201).json(category.toObject()); // Gửi trực tiếp object category

  } catch (err) {
    console.error("Create category error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// [PUT] /categories/:id
export const updateCategory = async (req, res) => {
  try {
    const { name, slug, description, imageUrl } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (imageUrl && imageUrl !== category.imageUrl) {
      // Delete old image from Cloudinary if exists
      if (category.imageUrl && category.imageUrl.includes("cloudinary")) {
        const publicId = category.imageUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`categories/${publicId}`);
      }

      // Upload new image if it's base64
      if (imageUrl.startsWith("data:image")) {
        const uploaded = await cloudinary.uploader.upload(imageUrl, {
          folder: "categories",
        });
        category.imageUrl = uploaded.secure_url;
      } else {
        category.imageUrl = imageUrl;
      }
    }

    category.name = name || category.name;
    category.slug = slug?.trim() || slugify(name || category.name, { lower: true });
    category.description = description || category.description;

    const updated = await category.save();
    res.json(updated);
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ message: "Error updating category", error: error.message });
  }
};

// [DELETE] /categories/:id
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (category.imageUrl && category.imageUrl.includes("cloudinary")) {
      const publicId = category.imageUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`categories/${publicId}`);
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting category", error: error.message });
  }
};
