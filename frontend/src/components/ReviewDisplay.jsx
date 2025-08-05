import StarRating from "./StarRating";

const ReviewDisplay = ({ review }) => {
  if (!review) return null;

  return (
    <div
      className={`bg-gray-800 p-4 rounded-md text-white shadow-sm border flex gap-4 ${
        review.isHidden ? "border-red-500" : "border-gray-700"
      }`}
    >
      {/* Avatar */}
      <img
        src={
          typeof review.user.avatar === "string"
            ? review.user.avatar // avatar cũ (string)
            : review.user.avatar?.url ||
              "https://res.cloudinary.com/dhd7fwafy/image/upload/v1752225767/sQxW2GrO_400x400_w9afhp.png"
        }
        alt="Avatar"
        className="w-10 h-10 rounded-full object-cover"
      />

      {/* Review Content */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="font-semibold text-blue-300">
            {review.user?.name || "Anonymous"}
          </span>
          <StarRating rating={review.rating} size={16} />
        </div>

        <p className="text-sm text-gray-300 whitespace-pre-line">
          {review.comment || "No comment provided."}
        </p>

        {/* ✅ Phản hồi từ nhân viên */}
        {review.reply && (
          <div className="mt-3 p-3 bg-gray-700/50 rounded-md border-l-4 border-blue-400">
            <p className="text-sm text-blue-300 font-medium mb-1">
              Staff reply:
            </p>
            <p className="text-sm text-gray-200">{review.reply.content}</p>
            {review.reply.staff?.name && (
              <p className="text-xs text-gray-400 italic mt-1">
                – {review.reply.staff.name}
              </p>
            )}
          </div>
        )}

        {review.isHidden && (
          <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
            <span>🚫</span> This review is being hidden by the admin
          </p>
        )}

        <p className="text-xs text-gray-500 mt-2">
          {new Date(review.createdAt).toLocaleDateString("vi-VN")}
        </p>
      </div>
    </div>
  );
};

export default ReviewDisplay;
