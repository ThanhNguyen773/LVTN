// controllers/banner.controller.js
import Banner from "../models/banner.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ }).sort({ createdAt: -1 });
    res.json(banners); // Trả mảng đúng format
  } catch (error) {
    console.error("Error in getAllBanners:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createBanner = async (req, res) => {
  try {
    const { image, link, category } = req.body;
    if (!image.startsWith("data:image")) {
  return res.status(400).json({ message: "Invalid image format" });
}

    if (!image || !category) {
      return res.status(400).json({ message: "Image and category are required." });
    }

    const uploadedImage = await cloudinary.uploader.upload(image, {
      folder: "banners",
    });

    const banner = await Banner.create({
      category,
      link,
      image: uploadedImage.secure_url,
    });

    res.status(201).json(banner);
  } catch (error) {
    console.error("Error in createBanner:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ message: "Banner not found." });
    }

    if (banner.image) {
      const publicId = banner.image?.match(/\/([^/]+)\.(jpg|jpeg|png|webp)$/)?.[1];

      try {
        await cloudinary.uploader.destroy(`banners/${publicId}`);
      } catch (error) {
        console.error("Error deleting banner image from Cloudinary:", error.message);
      }
    }

    await banner.deleteOne();

    res.json({ message: "Banner deleted successfully." });
  } catch (error) {
    console.error("Error in deleteBanner:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const toggleBannerActive = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    banner.isActive = !banner.isActive;
    await banner.save();

    res.json({ message: "Toggled banner status", isActive: banner.isActive });

  } catch (error) {
    console.error("Lỗi khi toggle banner:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getBannersByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const banners = await Banner.find({ category });
    res.json({ banners });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy banner theo danh mục", error: error.message });
  }
};



