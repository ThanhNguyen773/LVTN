import { useState } from "react";
import { useReviewStore } from "../stores/useReviewStore";
import StarRating from "./StarRating";

const ReviewEditForm = ({ review, onUpdated }) => {
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment || "");
  const { updateReview } = useReviewStore();

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!rating) return alert("Please select a rating!");

    const productId = review.product?._id || review.product;
    const orderId = review.order?._id || review.order;

    await updateReview(review._id, { rating, comment }, productId, orderId);

    if (typeof onUpdated === "function") {
      onUpdated(); // ✅ Ẩn form và refetch lại đánh giá
    }
  };

  return (
    <form onSubmit={handleUpdate} className="mt-2 bg-gray-700 p-4 rounded-md">
      <div className="mb-2">
        <StarRating
          rating={rating}
          setRating={setRating}
          interactive
          size={22}
        />
      </div>

      <textarea
        rows={3}
        className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-600"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button
        type="submit"
        className="mt-3 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm"
      >
        Update Review
      </button>
    </form>
  );
};

export default ReviewEditForm;
