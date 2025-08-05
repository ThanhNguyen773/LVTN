// middlewares/upload.middleware.js
import multer from "multer";

// Dùng memoryStorage để gửi file lên Cloudinary hoặc xử lý trực tiếp
const storage = multer.memoryStorage();

const upload = multer({ storage });

// 👉 Middleware cho logo (General Settings)
export const uploadLogoMiddleware = upload.single("logo");

// 👉 Middleware cho avatar (user profile)
export const uploadAvatarMiddleware = upload.single("avatar");
