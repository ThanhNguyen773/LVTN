import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { Link, useNavigate } from "react-router-dom";
import { MoveRight } from "lucide-react";

const formatCurrencyUSD = (n) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
};

const SimpleCartSummary = () => {
  const { subtotal, cart } = useCartStore();
  const navigate = useNavigate();

  // Số loại sản phẩm trong giỏ
  const totalProducts = cart.length;

  const handleCheckout = () => {
    navigate("/cart/checkout");
  };

  return (
    <motion.div
      className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-sm text-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-xl font-bold text-blue-300 text-center">Order Summary</p>

      <div className="flex justify-between">
        <span className="text-base">Products</span>
        <span className="text-base font-medium">{totalProducts}</span>
      </div>

      <div className="flex justify-between">
        <span className="text-base">Subtotal</span>
        <span className="text-base font-medium">
          {formatCurrencyUSD(subtotal || 0)}
        </span>
      </div>

      <div className="border-t border-gray-600 pt-2 flex justify-between font-bold">
        <span>Total</span>
        <span>{formatCurrencyUSD(subtotal || 0)}</span>
      </div>

      <button
        onClick={handleCheckout}
        className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded"
      >
        Place Order
      </button>

      <div className="flex items-center justify-center gap-2">
        <span className="text-sm font-normal text-gray-400">Or</span>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 underline hover:text-blue-300 hover:no-underline"
        >
          Continue Shopping
          <MoveRight size={16} />
        </Link>
      </div>
    </motion.div>
  );
};

export default SimpleCartSummary;
