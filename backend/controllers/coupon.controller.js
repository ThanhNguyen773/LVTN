import Coupon from "../models/coupon.model.js";
import { notifyAdminsAndStaffs, notifyAllUsers } from "../utils/notification.util.js";


export const getCoupon = async (req, res) => {
	try {
		const coupon = await Coupon.findOne({ userId: req.user._id, isActive: true });
		res.json(coupon || null);
	} catch (error) {
		console.log("Error in getCoupon controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const validateCoupon = async (req, res) => {
	try {
		const { code } = req.body;
		const coupon = await Coupon.findOne({
			code,
			isActive: true,
			$or: [
				{ userId: null },
				{ userId: req.user._id },
			],
		});

		if (!coupon) {
			return res.status(404).json({ message: "Mã giảm giá không tồn tại hoặc không dành cho bạn" });
		}

		if (coupon.expirationDate < new Date()) {
			coupon.isActive = false;
			await coupon.save();
			return res.status(404).json({ message: "Mã đã hết hạn" });
		}

		if (!coupon.isActive) {
			return res.status(400).json({ message: "Mã giảm giá không hoạt động" });
		}

		res.json({
			message: "Mã giảm giá hợp lệ!",
			code: coupon.code,
			discountPercentage: coupon.discountPercentage,
		});
	} catch (error) {
		console.log("Error in validateCoupon controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getAllCoupons = async (req, res) => {
	try {
		const coupons = await Coupon.find()
			.populate("userId", "name email")
			.sort({ createdAt: -1 });

		res.json({ coupons });
	} catch (error) {
		console.error("Error in getAllCoupons:", error.message);
		res.status(500).json({ error: "Server error" });
	}
};

export const createCoupon = async (req, res) => {
	try {
		const { code, discountPercentage, expirationDate, userId } = req.body;

		const existing = await Coupon.findOne({ code });
		if (existing) {
			return res.status(400).json({ error: "Coupon code already exists" });
		}

		const coupon = new Coupon({
			code,
			discountPercentage,
			expirationDate,
			userId: userId,
			isActive: true,
		});
		await coupon.save();

		const populated = await Coupon.findById(coupon._id).populate("userId", "name email");
		res.status(201).json(populated);

		await notifyAdminsAndStaffs(
			`🎟️ New coupon "${coupon.code}" has been created`,
			"system",
			"/secret-dashboard"
		);

		await notifyAllUsers(
			`🎁 You've received a discount coupon "${coupon.code}"! Apply it at checkout (Click My Coupon to view detail ) 🎉`,
			"promotion",
			"/profile"
		);

	} catch (error) {
		console.error("Error in createCoupon:", error.message);
		res.status(500).json({ error: "Server error" });
	}
};

export const deleteCoupon = async (req, res) => {
	try {
		const { id } = req.params;
		const deleted = await Coupon.findByIdAndDelete(id);

		if (!deleted) {
			return res.status(404).json({ error: "Coupon not found" });
		}

		res.json({ message: "Coupon deleted successfully", coupon: deleted });

		await notifyAdminsAndStaffs(
			`❌ Coupon "${deleted.code}" has been deleted`,
			"system",
			"/secret-dashboard"
		);
	} catch (error) {
		console.error("Error in deleteCoupon:", error.message);
		res.status(500).json({ error: "Server error" });
	}
};

export const deleteAllCoupons = async (req, res) => {
	try {
		await Coupon.deleteMany({});
		res.json({ message: "All coupons deleted" });
		await notifyAdminsAndStaffs("⚠️ All coupons have been deleted", "system");
	} catch (error) {
		res.status(500).json({ message: "Error deleting all coupons" });
	}
};

export const getUserCoupon = async (req, res) => {
	try {
		const coupon = await Coupon.findOne({ userId: req.user._id, isActive: true });
		res.json(coupon || null);
	} catch (error) {
		console.log("Error in getUserCoupon:", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const reactivateCoupon = async (req, res) => {
	try {
		const { code } = req.body;
		const coupon = await Coupon.findOne({ code, userId: req.user._id });

		if (!coupon) {
			return res.status(404).json({ message: "Coupon not found" });
		}

		coupon.isActive = true;
		await coupon.save();
		res.json({ message: "Coupon reactivated", coupon });
	} catch (error) {
		console.error("Error in reactivateCoupon:", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const updateCoupon = async (req, res) => {
	try {
		const { id } = req.params;
		const { code, discountPercentage, expirationDate, isActive, userId } = req.body;

		const updated = await Coupon.findByIdAndUpdate(
			id,
			{ code, discountPercentage, expirationDate, isActive, userId: userId || null },
			{ new: true }
		).populate("userId", "name email");

		if (!updated) {
			return res.status(404).json({ message: "Không tìm thấy mã giảm giá" });
		}

		res.json({ message: "Cập nhật thành công", coupon: updated });
		await notifyAdminsAndStaffs(`✏️ Coupon "${updated.code}" has been updated`, "system");
	} catch (error) {
		console.error("Error in updateCoupon:", error.message);
		res.status(500).json({ message: "Lỗi server", error: error.message });
	}
};

export const getAllActiveCouponsOfUser = async (req, res) => {
	try {
		const coupons = await Coupon.find({
			userId: req.user._id,
			isActive: true,
			expirationDate: { $gte: new Date() },
		}).sort({ expirationDate: 1 });

		res.json(coupons);
	} catch (error) {
		console.error("Lỗi khi lấy danh sách mã active:", error.message);
		res.status(500).json({ message: "Lỗi server", error: error.message });
	}
};
