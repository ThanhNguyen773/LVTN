import { Star } from "lucide-react";

const StarRating = ({ rating = 0, setRating = null, size = 16, showCount = false, totalReviews = 0, editable = false }) => {
  const rounded = Math.round(rating);
  const isEditable = typeof setRating === "function" || editable;

  return (
    <div className="flex items-center gap-1 text-yellow-400">
      {Array.from({ length: 5 }).map((_, idx) => (
        <Star
          key={idx}
          size={size}
          className={`cursor-pointer ${idx < rounded ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
          onClick={() => isEditable && setRating?.(idx + 1)}
        />
      ))}
      {showCount && (
        <span className="text-xs text-gray-400 ml-1">({totalReviews})</span>
      )}
    </div>
  );
};

export default StarRating;
