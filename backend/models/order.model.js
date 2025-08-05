import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    // stripeSessionId: {
    //   type: String,
    //   required: true,
    //   unique: true,
    // },
    stripeSessionId: {
      type: String,
      required: function () {
        return this.paymentMethod === "online"; // Chỉ required khi thanh toán online
      },
      unique: true,
      sparse: true,
    },

    coupon: {
      code: String,
      discountPercentage: Number,
    },
    status: {
      type: String,
      enum: [
        "Processing",
        "Shipping",
        "Delivered",
        "Canceled",
        "Returned",
        "Refunded",
      ],
      default: "Processing",
    },
    statusLog: [
      {
        status: {
          type: String,
          enum: [
            "Processing",
            "Shipping",
            "Delivered",
            "Canceled",
            "Returned",
            "Refunded",
          ],
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    orderCode: {
      type: String,
      unique: true,
      default: null,
    },
    shippingAddress: {
      phone: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      postalCode: String,
      country: String,
    },
    note: {
      type: String,
      default: "",
    },
    deliveredAt: {
      type: Date, // Thêm trường deliveredAt
    },
    paymentMethod: {
      type: String,
      enum: ["Stripe", "COD"],
      required: true,
      default: "Stripe",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
