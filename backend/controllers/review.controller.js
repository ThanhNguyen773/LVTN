import Review from "../models/review.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate("user", "name avatar");

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Lỗi lấy đánh giá" });
  }
};
// GET /api/reviews/product/:productId/all -- lấy tất cả, không lọc isHidden
export const getAllReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId })
      .populate("user", "name avatar")
      .populate("order", "orderCode")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Lỗi lấy tất cả đánh giá" });
  }
};

// export const getReviewsByProduct = async (req, res) => {
//   try {
//     const { productId } = req.params;
//     // const reviews = await Review.find({ product: productId })
//     const reviews = await Review.find({ product: productId, isHidden: false })
//       .populate("user", "name avatar")
//       .populate("order", "orderCode") // 🟢 Thêm dòng này
//       .sort({ createdAt: -1 });
//     res.status(200).json(reviews);
//   } catch (error) {
//     res.status(500).json({ error: "Lỗi lấy đánh giá theo sản phẩm" });
//   }
// };

export const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    let filter = { product: productId };

    // Nếu có đăng nhập, cho phép người dùng thấy đánh giá của chính họ kể cả khi bị ẩn
    if (req.user) {
      const userId = req.user._id;
      filter.$or = [
        { isHidden: false },
        { user: userId }, // chính họ
      ];
    } else {
      // không đăng nhập, chỉ thấy review public
      filter.isHidden = false;
    }

    const reviews = await Review.find(filter)
      .populate("user", "name avatar")
      .populate("order", "orderCode")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Lỗi lấy đánh giá theo sản phẩm" });
  }
};

export const createReview = async (req, res) => {
  try {
    const { product, order, rating, comment } = req.body;
    const user = req.user._id;

    // Kiểm tra người dùng đã mua sản phẩm trong đơn này chưa
    const hasPurchased = await Order.findOne({
      _id: order,
      user,
      status: "Delivered",
      "products.product": product,
    });

    if (!hasPurchased) {
      return res
        .status(403)
        .json({ error: "Bạn chưa mua sản phẩm này trong đơn này" });
    }

    // ✅ Kiểm tra nếu đã đánh giá trong đơn hàng này rồi
    const existingReview = await Review.findOne({ user, product, order });
    if (existingReview) {
      return res
        .status(400)
        .json({ error: "Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi" });
    }

    const review = new Review({ product, user, order, rating, comment });
    await review.save();

    await updateProductRating(product);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: "Không thể tạo đánh giá" });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const user = req.user._id;

    const review = await Review.findOneAndUpdate(
      { _id: id, user },
      { rating, comment },
      { new: true }
    );

    if (!review)
      return res
        .status(404)
        .json({
          error: "Không tìm thấy hoặc bạn không có quyền sửa đánh giá này",
        });
    await updateProductRating(review.product); // ✅ cập nhật lại rating
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ error: "Lỗi cập nhật đánh giá" });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user._id;

    const review = await Review.findOneAndDelete({ _id: id, user });
    if (!review)
      return res.status(404).json({ error: "Không tìm thấy đánh giá" });
    await updateProductRating(review.product); // ✅ cập nhật lại rating
    res.status(200).json({ message: "Đã xoá đánh giá" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi xoá đánh giá" });
  }
};

export const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId, isHidden: false });

  const ratingCount = reviews.length;
  const averageRating = ratingCount
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount
    : 0;

  await Product.findByIdAndUpdate(productId, {
    averageRating: Number(averageRating.toFixed(1)),
    ratingCount,
  });
};

export const toggleReviewVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { isHidden } = req.body;

    const review = await Review.findByIdAndUpdate(
      id,
      { isHidden },
      { new: true }
    ).populate("user", "name avatar");

    if (!review) {
      return res.status(404).json({ error: "Không tìm thấy đánh giá" });
    }
    await updateProductRating(review.product); // sau khi cập nhật visibility
    res
      .status(200)
      .json({
        message: `Đánh giá đã được ${isHidden ? "ẩn" : "hiện"}`,
        review,
      });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Không thể cập nhật trạng thái hiển thị đánh giá" });
  }
};

export const replyReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const staffId = req.user._id;

    const review = await Review.findById(id).populate("user", "name avatar");
    if (!review)
      return res.status(404).json({ error: "Không tìm thấy đánh giá" });

    review.reply = {
      content,
      repliedAt: new Date(),
      staff: staffId,
    };

    await review.save();
    const populatedReview = await Review.findById(id)
      .populate("user", "name avatar")
      .populate("reply.staff", "name avatar");

    res
      .status(200)
      .json({ message: "Đã trả lời đánh giá", review: populatedReview });
  } catch (error) {
    res.status(500).json({ error: "Không thể trả lời đánh giá" });
  }
};

export const editReplyReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const staffId = req.user._id;

    const review = await Review.findById(id);

    if (!review || !review.reply) {
      return res.status(404).json({ error: "Không có phản hồi để sửa" });
    }

    review.reply.content = content;
    review.reply.repliedAt = new Date();
    review.reply.staff = staffId; // cập nhật người chỉnh sửa

    await review.save();

    res.status(200).json({ message: "Đã cập nhật phản hồi", review });
  } catch (error) {
    res.status(500).json({ error: "Không thể cập nhật phản hồi" });
  }
};

export const deleteReply = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    review.reply = undefined;
    await review.save();

    res.status(200).json({ message: "Reply deleted", review });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete reply", error });
  }
};
