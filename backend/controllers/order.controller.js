import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import {
  notifyAdminsAndStaffs,
  notifyAllUsers,
  notifyUser,
} from "../utils/notification.util.js";

// ✅ [GET] Lấy tất cả đơn hàng (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const from = req.query.from ? new Date(req.query.from) : null;
    const to = req.query.to ? new Date(req.query.to) : null;
    const status = req.query.status || null;
    const search = req.query.search || "";
    const paymentMethod = req.query.paymentMethod || null; // thêm filter theo payment method
    const query = {};

    if (from && to) {
      query.createdAt = {
        $gte: new Date(from.setHours(0, 0, 0, 0)),
        $lte: new Date(to.setHours(23, 59, 59, 999)),
      };
    }

    if (status) {
      query.status = status;
    }
    if (paymentMethod) {
      query.paymentMethod = paymentMethod; // thêm filter theo payment method
    }

    // Tìm các đơn hàng phù hợp
    // Cập nhật các đơn hàng "Shipping" quá 15 ngày thành "Delivered"
    const now = new Date();
    const shippingOrders = await Order.find({ status: "Shipping" });

    for (const order of shippingOrders) {
      const lastShippingLog = order.statusLog
        .filter((log) => log.status === "Shipping")
        .sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt))[0];

      const shippedDate =
        lastShippingLog?.changedAt || order.updatedAt || order.createdAt;
      const daysSinceShipping = Math.floor(
        (now - new Date(shippedDate)) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceShipping > 15) {
        order.status = "Delivered";
        order.statusLog.push({
          status: "Delivered",
          changedAt: now,
          changedBy: null, // hoặc đặt là "system"
        });
        await order.save();
      }
    }

    let orders = await Order.find(query)
      .populate("user", "name email")
      .populate("products.product", "name price")
      .populate("coupon", "code discountPercentage")
      .sort({ createdAt: -1 });

    // Áp dụng tìm kiếm theo orderCode hoặc tên khách hàng
    if (search) {
      orders = orders.filter(
        (order) =>
          order.orderCode?.toLowerCase().includes(search.toLowerCase()) ||
          order.user?.name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    const totalOrders = orders.length;
    const paginatedOrders = orders.slice(skip, skip + limit);

    res.status(200).json({
      orders: paginatedOrders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
    });
  } catch (err) {
    console.error("🔥 Lỗi lấy đơn hàng:", err);
    res.status(500).json({ error: "Không thể lấy danh sách đơn hàng" });
  }
};

// // ✅ [POST] Tạo đơn hàng mới ko xài được - có thể bỏ
// export const createOrder = async (req, res) => {

//   try {
//     const { products, totalAmount, stripeSessionId, couponId, orderCode } = req.body;
//     const userId = req.user._id;

//     if (!products || !Array.isArray(products) || products.length === 0) {
//       return res.status(400).json({ error: "Danh sách sản phẩm không hợp lệ." });
//     }

//     const newOrder = new Order({
//       user: userId,
//       products,
//       totalAmount,
//       stripeSessionId,
//       coupon: couponId || null,
//       orderCode,
//     });

//     const savedOrder = await newOrder.save();

//      // ✅ Cập nhật sold cho từng sản phẩm
//     for (const item of products) {
//       console.log("Cập nhật sold:", item.product, "số lượng:", item.quantity);
//       await Product.findByIdAndUpdate(
//         new mongoose.Types.ObjectId(item.product),
//         { $inc: { sold: item.quantity } },
//         { new: true }
//       );
//     }

//     res.status(201).json(savedOrder);
//   } catch (error) {
//     console.error("Lỗi tạo đơn hàng:", error);
//     res.status(500).json({ error: "Không thể tạo đơn hàng" });
//   }
// };

// ✅ [GET] Lấy đơn hàng theo ID (User hoặc Admin)
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("products.product", "name price")
      .populate("coupon", "code discountPercentage") // thêm dòng này
      .populate("statusLog.changedBy", "name"); // Optional

    if (!order) {
      return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
    }

    // Nếu không phải admin thì chỉ được xem đơn hàng của chính mình
    const isAdminOrStaff =
      req.user.role === "admin" || req.user.role === "staff";
    if (
      !isAdminOrStaff &&
      order.user._id.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ error: "Không có quyền truy cập đơn hàng này" });
    }
    // console.log("Order gửi về:", order.orderCode);

    res.status(200).json({
      ...order.toObject(),
      statusLog: order.statusLog,
    }); //29/07/2025
  } catch (error) {
    console.error("Lỗi lấy đơn hàng:", error);
    res.status(500).json({ error: "Không thể lấy đơn hàng" });
  }
};

// ✅ [DELETE] Xoá đơn hàng (Admin)
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Không tìm thấy đơn hàng để xoá" });
    }

    res.status(200).json({ message: "Đơn hàng đã được xoá" });
  } catch (error) {
    console.error("Lỗi xoá đơn hàng:", error);
    res.status(500).json({ error: "Không thể xoá đơn hàng" });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "products.product",
        select: "name reviews",
        populate: {
          path: "reviews",
          model: "Review",
          match: { user: req.user._id }, // Chỉ lấy review của chính user
          select: "rating comment user order", // chọn order để so sánh phía FE
        },
      })
      .populate("coupon", "code discountPercentage")
      .populate("user", "name email");

    res.status(200).json(
      orders.map((order) => ({
        ...order.toObject(),
        statusLog: order.statusLog,
      }))
    );
  } catch (error) {
    console.error("Lỗi lấy đơn hàng người dùng:", error);
    res.status(500).json({ error: "Không thể lấy đơn hàng cá nhân" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "Processing",
      "Shipping",
      "Delivered",
      "Canceled",
      "Returned",
      "Refunded",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Trạng thái không hợp lệ" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
    }

    // ✅ Kiểm soát luồng chuyển trạng thái hợp lệ
    const validNextStatuses = {
      Processing: ["Shipping", "Canceled"],
      Shipping: ["Delivered", "Returned"],
      Delivered: ["Returned"],
      Returned: ["Refunded"],
    };

    if (!validNextStatuses[order.status]?.includes(status)) {
      return res.status(400).json({
        error: `Không thể chuyển trạng thái từ '${order.status}' sang '${status}'`,
      });
    }

    // ✅ Lưu trạng thái mới
    order.status = status;

    // ✅ Ghi log trạng thái
    order.statusLog.push({
      status,
      changedAt: new Date(),
      changedBy: req.user._id,
    });

    await order.save();
    await notifyUser(
      order.user,
      `📦 [#${order.orderCode}] Status updated: "${status}"`,
      "order",
      `/orders/${order._id}`
    );

    res.status(200).json({ message: "Cập nhật trạng thái thành công", order });
  } catch (err) {
    console.error("Lỗi cập nhật trạng thái:", err);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
};

export const updateMultipleOrderStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;

    if (!Array.isArray(ids) || !status) {
      return res
        .status(400)
        .json({ error: "Thiếu danh sách ID hoặc trạng thái" });
    }

    // ✅ Chỉ cho phép chuyển sang 'Shipping'
    if (status !== "Shipping") {
      return res
        .status(400)
        .json({ error: "Chỉ được phép cập nhật trạng thái sang 'Shipping'" });
    }

    // Lấy toàn bộ đơn cần cập nhật
    const orders = await Order.find({ _id: { $in: ids } });

    // ✅ Kiểm tra tất cả phải đang ở trạng thái 'Processing'
    const invalidOrders = orders.filter((o) => o.status !== "Processing");

    if (invalidOrders.length > 0) {
      return res.status(400).json({
        error: "Chỉ được phép cập nhật đơn từ 'Processing' sang 'Shipping'",
      });
    }

    // ✅ Cập nhật trạng thái và ghi log lịch sử nếu cần
    const updateOps = orders.map((order) => {
      return Order.updateOne(
        { _id: order._id },
        {
          $set: { status: "Shipping" },
          $push: {
            statusLog: {
              status: "Shipping",
              changedAt: new Date(),
              changedBy: req.user._id, // nếu muốn log staff
            },
          },
        }
      );
    });

    await Promise.all(updateOps);

    res.status(200).json({ success: true, updated: updateOps.length });
  } catch (err) {
    console.error("Lỗi cập nhật trạng thái hàng loạt:", err);
    res.status(500).json({ error: "Không thể cập nhật trạng thái hàng loạt" });
  }
};

export const cancelOrderByUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: "Không tìm thấy đơn hàng" });
    }

    // Kiểm tra quyền sở hữu
    if (order.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "Bạn không có quyền huỷ đơn hàng này" });
    }

    // Chỉ được huỷ khi trạng thái là "Processing"
    if (order.status !== "Processing") {
      return res
        .status(400)
        .json({ error: "Chỉ có thể huỷ đơn hàng khi đang xử lý" });
    }

    order.status = "Canceled";
    await order.save();
    // 🔔 Notify admins and staffs
    await notifyAdminsAndStaffs(
      `❌ Order [#${order.orderCode}] has been canceled by the user`,
      "order",
      `/orders/${order._id}`
    );

    // 🔔 Notify the user
    await notifyUser(
      order.user,
      `❌ You have successfully canceled order [#${order.orderCode}]`,
      "order",
      `/orders/${order._id}`
    );
    res.status(200).json({ message: "Đơn hàng đã được huỷ", order });
  } catch (err) {
    console.error("Lỗi huỷ đơn hàng bởi user:", err);
    res.status(500).json({ error: "Không thể huỷ đơn hàng" });
  }
};

// ✅ [GET] Lấy tất cả đơn hàng (không phân trang)
export const getAllOrdersWithoutPagination = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("products.product", "name price")
      .populate("coupon", "code discountPercentage");

    res.status(200).json({ orders });
  } catch (err) {
    console.error("Lỗi lấy tất cả đơn hàng:", err);
    res.status(500).json({ error: "Không thể lấy tất cả đơn hàng" });
  }
};

export const confirmOrderDelivered = async (req, res) => {
  try {
    const userId = req.user._id;
    const orderId = req.params.id;

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Shipping") {
      return res
        .status(400)
        .json({ message: "Order is not currently in 'Shipping' status" });
    }

    if (order.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "You are not authorized to confirm this order" });
    }

    order.status = "Delivered";
    order.deliveredAt = new Date();

    order.statusLog.push({
      status: "Delivered",
      changedAt: new Date(),
      changedBy: userId,
    });

    await order.save();

    // 🔔 Notify Admins & Staffs
    await notifyAdminsAndStaffs(
      `📬 Order [#${order.orderCode}] has been confirmed as delivered by the user`,
      "order",
      `/orders/${order._id}`
    );

    // 🔔 Notify the User
    await notifyUser(
      order.user,
      `✅ You have confirmed that order [#${order.orderCode}] was delivered`,
      "order",
      `/orders/${order._id}`
    );

    res
      .status(200)
      .json({ message: "Order delivery confirmed successfully", order });
  } catch (error) {
    console.error("Error in confirmOrderDelivered:", error);
    res
      .status(500)
      .json({
        message: "Failed to confirm order delivery",
        error: error.message,
      });
  }
};
