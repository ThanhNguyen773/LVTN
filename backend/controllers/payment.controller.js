//
import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";

import { stripe } from "../lib/stripe.js";
import Product from "../models/product.model.js";
import {
  notifyAdminsAndStaffs,
  notifyUser,
} from "../utils/notification.util.js";

export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode, shippingAddress, note } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid or empty products array" });
    }

    let totalAmount = 0;
    const lineItems = products.map((product) => {
      const amount = Math.round(product.price * 100); // cents
      totalAmount += amount * product.quantity;
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: [product.image],
          },
          unit_amount: amount,
        },
        quantity: product.quantity || 1,
      };
    });

    let coupon = null;
    let discountId = null;
    let discountPercentage = "";
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user._id,
        isActive: true,
      });

      if (coupon) {
        totalAmount -= Math.round(
          (totalAmount * coupon.discountPercentage) / 100
        );
        discountId = await createStripeCoupon(coupon.discountPercentage);
        discountPercentage = coupon.discountPercentage.toString(); //new
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      discounts: discountId ? [{ coupon: discountId }] : [],
      metadata: {
        userId: req.user._id.toString(),
        couponCode: couponCode || "",
        // discountPercentage: coupon?.discountPercentage?.toString() || "",
        discountPercentage,
        shippingAddress: JSON.stringify(shippingAddress || {}),
        note: note || "",
        products: JSON.stringify(
          products.map((p) => ({
            id: p._id,
            quantity: p.quantity,
            price: p.price,
          }))
        ),
      },
    });

    if (totalAmount >= 20000) {
      await createNewCoupon(req.user._id);
    }

    res.status(200).json({
      id: session.id,
      totalAmount: totalAmount / 100,
    });
  } catch (error) {
    console.error("Error processing checkout:", error);
    res
      .status(500)
      .json({ message: "Error processing checkout", error: error.message });
  }
};

export const checkoutSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const shippingAddress = JSON.parse(
      session.metadata.shippingAddress || "{}"
    );
    const note = session.metadata.note || "";

    const existingOrders = await Order.find({ stripeSessionId: sessionId });
    if (existingOrders.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Order already exists.",
        order: existingOrders[0],
      });
    }

    if (session.payment_status !== "paid") {
      return res
        .status(400)
        .json({ success: false, message: "Payment not completed" });
    }

    const products = JSON.parse(session.metadata.products);

    if (session.metadata.couponCode) {
      await Coupon.findOneAndUpdate(
        { code: session.metadata.couponCode, userId: session.metadata.userId },
        { isActive: false }
      );
    }

    const newOrder = new Order({
      user: session.metadata.userId,
      products: products.map((product) => ({
        product: product.id,
        quantity: product.quantity,
        price: product.price,
      })),
      totalAmount: session.amount_total / 100,
      stripeSessionId: sessionId,
      shippingAddress,
      note,
    });

    if (session.metadata.couponCode) {
      newOrder.coupon = {
        code: session.metadata.couponCode,
        discountPercentage: parseInt(
          session.metadata.discountPercentage || "0",
          10
        ),
      };
    }

    const savedOrder = await newOrder.save();

    for (const item of products) {
      try {
        await Product.findByIdAndUpdate(
          item.id,
          { $inc: { sold: item.quantity } },
          { new: true }
        );
      } catch (err) {
        console.error("❌ Failed to update product sold count:", err.message);
      }
    }

    const afterSaveOrders = await Order.find({
      stripeSessionId: sessionId,
    }).sort({ createdAt: -1 });
    if (afterSaveOrders.length > 1) {
      const toDelete = afterSaveOrders[0];
      const toKeep = afterSaveOrders[1];
      await Order.findByIdAndDelete(toDelete._id);
      return res.status(200).json({
        success: true,
        message: "Duplicate order detected. Latest one was removed.",
        order: toKeep,
      });
    }

    // Tạo mã đơn hàng
    const createdAt = new Date(savedOrder.createdAt);
    const ddmmyyyy = `${createdAt.getDate().toString().padStart(2, "0")}${(
      createdAt.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}${createdAt.getFullYear()}`;
    const channel = "W";
    const orderCode = `ORD${ddmmyyyy}T${channel}${savedOrder._id
      .toString()
      .slice(-4)
      .toUpperCase()}`;
    await Order.findByIdAndUpdate(savedOrder._id, { orderCode });

    // Xoá giỏ hàng người dùng
    const user = await User.findById(session.metadata.userId);
    if (user) {
      user.cartItems = [];
      await user.save();
    }

    // 🔔 Thông báo cho user
    await notifyUser(
      session.metadata.userId,
      `🛒 Your order [#${orderCode}] has been placed successfully. You can track it here.`,
      "order",
      `/orders/${savedOrder._id}`
    );

    // 🔔 Thông báo cho admin/staff
    await notifyAdminsAndStaffs(
      `📦 A new order [#${orderCode}] has been placed. Please review it here.`,
      "order",
      `/orders/${savedOrder._id}`
    );

    return res.status(200).json({
      success: true,
      message: "Order placed successfully!",
      order: { ...savedOrder.toObject(), orderCode },
    });
  } catch (error) {
    console.error("❌ Error during checkout success:", error);
    res.status(500).json({
      message: "Failed to process successful checkout",
      error: error.message,
    });
  }
};

async function createStripeCoupon(discountPercentage) {
  const coupon = await stripe.coupons.create({
    percent_off: discountPercentage,
    duration: "once",
  });
  return coupon.id;
}

async function createNewCoupon(userId) {
  await Coupon.findOneAndDelete({ userId });

  const newCoupon = new Coupon({
    code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    userId: userId,
    isActive: true,
  });

  await newCoupon.save();
  return newCoupon;
}

export const createCODOrder = async (req, res) => {
  try {
    const { products, couponCode, shippingAddress, note } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid or empty products array" });
    }

    let totalAmount = 0;
    const orderProducts = products.map((product) => {
      totalAmount += product.price * product.quantity;
      return {
        product: product._id,
        quantity: product.quantity,
        price: product.price,
      };
    });

    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user._id,
        isActive: true,
      });

      if (coupon) {
        totalAmount -= Math.round(
          (totalAmount * coupon.discountPercentage) / 100
        );
        coupon.isActive = false;
        await coupon.save();
      }
    }

    // ✅ Tạo trước instance Order (đã có _id)
    const newOrder = new Order({
      user: req.user._id,
      products: orderProducts,
      totalAmount,
      shippingAddress,
      note,
      paymentMethod: "COD",
      coupon: coupon
        ? {
            code: coupon.code,
            discountPercentage: coupon.discountPercentage,
          }
        : undefined,
    });

    // ✅ Tạo orderCode trước khi save
    const createdAt = new Date();
    const ddmmyyyy = `${createdAt.getDate().toString().padStart(2, "0")}${(
      createdAt.getMonth() + 1
    ).toString().padStart(2, "0")}${createdAt.getFullYear()}`;
    const channel = "C"; // COD
    const orderCode = `ORD${ddmmyyyy}T${channel}${newOrder._id
      .toString()
      .slice(-4)
      .toUpperCase()}`;

    newOrder.orderCode = orderCode;

    const savedOrder = await newOrder.save(); // ✅ orderCode đã có

    for (const item of products) {
      await Product.findByIdAndUpdate(
        item._id,
        { $inc: { sold: item.quantity } },
        { new: true }
      );
    }

    const user = await User.findById(req.user._id);
    if (user) {
      user.cartItems = [];
      await user.save();
    }

    await notifyUser(
      req.user._id,
      `🛒 Your COD order [#${orderCode}] has been placed successfully.`,
      "order",
      `/orders/${savedOrder._id}`
    );

    await notifyAdminsAndStaffs(
      `📦 A new COD order [#${orderCode}] has been placed.`,
      "order",
      `/orders/${savedOrder._id}`
    );

    res.status(200).json({
      success: true,
      message: "COD order placed successfully!",
      order: { ...savedOrder.toObject() }, // orderCode đã nằm trong savedOrder rồi
    });
  } catch (error) {
    console.error("❌ Error creating COD order:", error);
    res.status(500).json({ error: "Failed to place COD order" });
  }
};

