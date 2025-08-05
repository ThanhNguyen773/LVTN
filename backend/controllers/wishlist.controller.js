import User from "../models/user.model.js";
import Product from "../models/product.model.js";

// Lấy danh sách wishlist của user hiện tại
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");
    const safeWishlist = Array.isArray(user?.wishlist) ? user.wishlist : [];
    res.json(safeWishlist);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Thêm sản phẩm vào wishlist
export const addToWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;

    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }

    res.status(200).json({ message: "Added to wishlist" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Xoá sản phẩm khỏi wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== productId
    );

    await user.save();

    res.status(200).json({ message: "Removed from wishlist" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
