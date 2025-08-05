import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { Link, useNavigate } from "react-router-dom";
import { Loader, MoveRight, CreditCard, Package } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";
import axios from "../lib/axios";

const stripePromise = loadStripe(
  "pk_test_51Rcdm7H9GP1NV4gHzSkuwyx3LmFSkXbnuBXlTISczsQecgr9Ah4nKnKHUoRUZNm0wFbarTLGNfd56HIltYcbwmdu00hUEiDW6G"
);

const OrderSummary = () => {
  const { total, subtotal, coupon, isCouponApplied, cart, removeCoupon } = useCartStore();
  const [localLoading, setLocalLoading] = useState(false);
  const navigate = useNavigate();

  const savings = subtotal - total;
  const formattedSubtotal = subtotal.toFixed(2);
  const formattedTotal = total.toFixed(2);
  const formattedSavings = savings.toFixed(2);

  const handlePayment = async () => {
    try {
      setLocalLoading(true);
      const stripe = await stripePromise;

      const shippingAddress = JSON.parse(localStorage.getItem("shippingAddress"));
      const note = localStorage.getItem("orderNote");

      const res = await axios.post("/payments/create-checkout-session", {
        products: cart,
        couponCode: coupon ? coupon.code : null,
        shippingAddress,
        note,
      });

      const session = res.data;
      const result = await stripe.redirectToCheckout({ sessionId: session.id });

      if (result.error) {
        console.error("Stripe redirect error:", result.error);
      }
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleCODPayment = async () => {
    try {
      setLocalLoading(true);

      const shippingAddress = JSON.parse(localStorage.getItem("shippingAddress"));
      const note = localStorage.getItem("orderNote");

      const res = await axios.post("/payments/cod-order", {
        products: cart,
        couponCode: coupon ? coupon.code : null,
        shippingAddress,
        note,
      });

      if (res.data?.success) {
        window.location.href = `/purchase-success?order_id=${res.data.order._id}`;
      } else {
        console.error("COD payment failed:", res.data?.message);
      }
    } catch (error) {
      console.error("COD Payment error:", error);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleContinueShopping = () => {
    removeCoupon(); // xóa coupon trước khi chuyển trang
    navigate("/");
  };

  return (
    <motion.div
      className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-xl font-bold text-blue-300 text-center">Order Summary</p>

      <div className="space-y-4">
        <div className="space-y-2">
          <dl className="flex items-center justify-between gap-4">
            <dt className="text-base font-normal text-gray-300">Total Amount</dt>
            <dd className="text-base font-medium text-white">${formattedSubtotal}</dd>
          </dl>

          {savings > 0 && (
            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-300">Discount</dt>
              <dd className="text-base font-medium text-green-400">-${formattedSavings}</dd>
            </dl>
          )}

          {coupon && isCouponApplied && (
            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-300">
                Coupon ({coupon.code})
              </dt>
              <dd className="text-base font-medium text-green-400">
                -{coupon.discountPercentage}%
              </dd>
            </dl>
          )}
          <dl className="flex items-center justify-between gap-4 border-t border-gray-600 pt-2">
            <dt className="text-base font-bold text-white">Total Payment</dt>
            <dd className="text-base font-bold text-blue-400">${formattedTotal}</dd>
          </dl>
        </div>

        <p className="text-center text-lg font-semibold text-gray-200 mt-4">
          Choose Payment Method
        </p>

        <motion.button
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePayment}
          disabled={localLoading}
        >
          {localLoading ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard size={18} />
              Pay via Stripe
            </>
          )}
        </motion.button>

        <motion.button
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCODPayment}
          disabled={localLoading}
        >
          {localLoading ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Package size={18} />
              Pay on Delivery (COD)
            </>
          )}
        </motion.button>

        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-normal text-gray-400">Or</span>
          <button
            onClick={handleContinueShopping}
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 underline hover:text-blue-300 hover:no-underline"
          >
            Continue Shopping
            <MoveRight size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderSummary;
