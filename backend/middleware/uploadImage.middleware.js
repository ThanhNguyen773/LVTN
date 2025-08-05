// middleware/uploadImage.middleware.js
import multer from "multer";

const storage = multer.memoryStorage(); // Dùng buffer

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ hỗ trợ ảnh"), false);
    }
  },
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB
  },
});

export const uploadImage = upload.single("image"); // ⬅️ tên phải trùng!
