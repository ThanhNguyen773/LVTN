// middleware/optionalAuth.js
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const optionalAuth = async (req, res, next) => {
	try {
		const accessToken = req.cookies.accessToken;

		if (!accessToken) {
			req.user = null; // Không có token => không có user
			return next();
		}

		try {
			const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
			const user = await User.findById(decoded.userId).select("-password");

			if (!user) {
				req.user = null;
			} else {
				req.user = user;
			}
		} catch (err) {
			// Token sai hoặc hết hạn => xử lý như chưa đăng nhập
			req.user = null;
		}

		next();
	} catch (err) {
		console.error("optionalAuth error:", err.message);
		req.user = null;
		next();
	}
};
