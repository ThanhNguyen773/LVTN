import { useEffect } from "react";
import { useReviewStore } from "../stores/useReviewStore";
import ReviewDisplay from "./ReviewDisplay";

const AllReviewsOfProduct = ({ productId }) => {
  const { reviewsMap, fetchReviewsByProduct, loading } = useReviewStore();

  useEffect(() => {
    if (productId) {
      fetchReviewsByProduct(productId);
    }
  }, [productId]);

  const allReviews = reviewsMap[productId] || [];

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-white mb-4 border-b border-gray-600 pb-2">
        Customer Reviews ({allReviews.length})
      </h3>

      {loading ? (
        <p className="text-gray-400 italic">Loading reviews...</p>
      ) : allReviews.length === 0 ? (
        <p className="text-gray-400 italic">No reviews yet for this product.</p>
      ) : (
        <div className="space-y-3">
          {allReviews.map((review) => (
            <ReviewDisplay key={review._id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AllReviewsOfProduct;
