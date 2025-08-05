import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(
    `refresh_token:${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60
  ); // 7days
};

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, // prevent XSS attacks, cross site scripting attack
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // prevent XSS attacks, cross site scripting attack
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const signup = async (req, res) => {
  const { email, password, name, phone, address, dateOfBirth, avatar } =
    req.body;
  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = await User.create({
      name,
      email,
      password,
      phone,
      address,
      dateOfBirth,
      avatar,
    });

    // matching online after signup
    user.isOnline = true;
    await user.save();

    // authenticate
    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      dateOfBirth: user.dateOfBirth,
      avatar: user.avatar,
      isOnline: user.isOnline,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      user.isOnline = true;
      await user.save();

      const { accessToken, refreshToken } = generateTokens(user._id);
      await storeRefreshToken(user._id, refreshToken);
      setCookies(res, accessToken, refreshToken);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        dateOfBirth: user.dateOfBirth,
        avatar: user.avatar,
        isOnline: user.isOnline,
        createdAt: user.createdAt,
      });
    } else {
      res.status(400).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      await redis.del(`refresh_token:${decoded.userId}`);
      await User.findByIdAndUpdate(decoded.userId, { isOnline: false });
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Cập nhật thông tin người dùng của admin
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id; // <-- dùng ID trong params thay vì từ token

    const { name, phone, address, role, isActive, dateOfBirth } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, phone, address, role, isActive, dateOfBirth },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Admin update user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//người dùng tự cập nhật thông tin

export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, phone, address, dateOfBirth, avatar } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, phone, address, dateOfBirth, avatar },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users); // 👈 Quan trọng: trả về array
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// this will refresh the access token
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

    if (storedToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: "Token refreshed successfully" });
  } catch (error) {
    console.log("Error in refreshToken controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
    // res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Xoá avatar cũ nếu có
    if (user.avatar?.public_id) {
      try {
        await cloudinary.uploader.destroy(user.avatar.public_id);
      } catch (err) {
        console.warn("⚠️ Failed to delete old avatar:", err.message);
      }
    }

    // Upload ảnh mới
    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "avatars",
            public_id: `user_${userId}_${Date.now()}`,
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(buffer);
      });
    };

    const result = await streamUpload(req.file.buffer);

    // Cập nhật avatar mới
    user.avatar = {
      url: result.secure_url,
      public_id: result.public_id,
    };
    await user.save();

    res.status(200).json({
      message: "Avatar updated successfully",
      avatar: user.avatar,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (err) {
    console.error("Upload avatar error:", err.message);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Both current and new passwords are required." });
    }
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Current password is incorrect." });
    }

    user.password = newPassword;
    await user.save();

    // (Optional) Invalidate existing refresh tokens (logout from all other sessions)
    await redis.del(`refresh_token:${user._id}`);

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Change password error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Admin tạo tài khoản nhân viên hoặc admin
export const createUserByAdmin = async (req, res) => {
  try {
    const { name, email, password, phone, address, dateOfBirth, role } = req.body;

    // Chỉ cho phép admin tạo tài khoản staff hoặc admin
    if (!["staff", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role must be 'staff' or 'admin'" });
    }

    // Kiểm tra email tồn tại
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Tạo user mới
    const newUser = await User.create({
      name,
      email,
      password,
      phone,
      address,
      dateOfBirth,
      role,
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        address: newUser.address,
        dateOfBirth: newUser.dateOfBirth,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Create user by admin error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};