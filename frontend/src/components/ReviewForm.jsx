import { useState } from "react";
import { useReviewStore } from "../stores/useReviewStore";
import StarRating from "./StarRating";

const ReviewForm = ({ productId, orderId, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const { createReview, fetchReviewsByProduct, loading } = useReviewStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      alert("Please select a rating!");
      return;
    }

    try {
      await createReview({
        product: productId,
        order: orderId,
        rating,
        comment,
      });

      await fetchReviewsByProduct(productId, orderId);
      setRating(0);
      setComment('');

      if (onSubmitted) onSubmitted();
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 bg-gray-900/60 p-4 rounded-md border border-gray-700">
      {/* Label for star rating */}
      <label className="block text-sm font-medium text-white mb-1">
        Product Quality
      </label>
      <div className="mb-3">
        <StarRating rating={rating} setRating={setRating} editable />
      </div>

      <textarea
        rows={3}
        className="w-full p-2 rounded-md bg-gray-800 text-white border border-gray-600"
        placeholder="Write your review here..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button
        type="submit"
        disabled={loading}
        className="mt-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
};

export default ReviewForm;
