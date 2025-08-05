import express from "express";
import { login, logout, signup, refreshToken, getProfile, updateUser, getAllUsers, deleteUser, updateMyProfile, uploadAvatar, changePassword, createUserByAdmin } from "../controllers/auth.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { uploadAvatarMiddleware } from "../middleware/upload.middleware.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/profile", protectRoute, getProfile);
router.put("/update-profile/:id", protectRoute, adminRoute, updateUser);
router.put("/me", protectRoute, updateMyProfile);
router.put("/me/change-password", protectRoute, changePassword);
router.put("/me/avatar", protectRoute, uploadAvatarMiddleware, uploadAvatar);
router.post("/create", protectRoute, adminRoute, createUserByAdmin);
router.delete("/:id", protectRoute, deleteUser);

router.get("/all", protectRoute, adminRoute,getAllUsers);



export default router;