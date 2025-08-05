import express from "express";
import multer from "multer";
import {
  getGeneralSetting,
  updateGeneralSetting,
} from "../controllers/generalSetting.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // ví dụ: 2MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ cho phép upload ảnh (image/*)"));
    }
  },
});


// ✅ Public: Ai cũng có thể lấy được thông tin cấu hình
router.get("/", getGeneralSetting);

// ✅ Admin Only: Chỉ admin mới được chỉnh sửa (upload kèm theo "logo")
router.put("/", protectRoute, adminRoute, upload.single("logo"), updateGeneralSetting);


// Multer / upload errors
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message.includes("upload ảnh")) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

export default router;
