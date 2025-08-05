// models/review.model.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true }, // ✅ thêm dòng này
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    isHidden: { type: Boolean, default: false },
    
    reply: {
      content: { type: String },
      repliedAt: { type: Date },
      staff: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // người trả lời (admin hoặc staff)
    },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);
export default Review;
