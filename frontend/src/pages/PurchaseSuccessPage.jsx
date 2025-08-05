import { ArrowRight, CheckCircle, HandHeart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import axios from "../lib/axios";
import Confetti from "react-confetti";
import LoadingSpinner from "../components/LoadingSpinner";
import { useProductStore } from "../stores/useProductStore";

const PurchaseSuccessPage = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const { clearCart } = useCartStore();
  const navigate = useNavigate();
  const { fetchAllProducts } = useProductStore();

  useEffect(() => {
    fetchAllProducts(); // 🧩 Load lại danh sách sản phẩm sau khi mua hàng
  }, []);

  // useEffect(() => {
  // 	const sessionId = new URLSearchParams(window.location.search).get("session_id");

  // 	if (!sessionId) {
  // 		setError("Session ID not found in URL.");
  // 		setIsProcessing(false);
  // 		return;
  // 	}

  // 	const storedSession = localStorage.getItem("completedSessionId");

  // 	if (storedSession === sessionId) {
  // 		setIsProcessing(false);
  // 		return;
  // 	}

  // 	const handleSuccess = async () => {
  // 		try {
  // 			const res = await axios.post("/payments/checkout-success", { sessionId });
  // 			const orderData = res.data.order;
  // 			setOrder(orderData);
  // 			clearCart();
  // 			localStorage.setItem("completedSessionId", sessionId);
  // 		} catch (err) {
  // 			console.error(err);
  // 			setError("Payment failed.");
  // 		} finally {
  // 			setIsProcessing(false);
  // 		}
  // 	};

  // 	handleSuccess();
  // }, [clearCart]); //29/07/2025

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get(
      "session_id"
    );
    const orderId = new URLSearchParams(window.location.search).get("order_id");

    const fetchStripeOrder = async () => {
      const storedSession = localStorage.getItem("completedSessionId");
      if (storedSession === sessionId) {
        setIsProcessing(false);
        return;
      }

      try {
        const res = await axios.post("/payments/checkout-success", {
          sessionId,
        });
        
        const orderData = res.data.order;
        setOrder(orderData);
        clearCart();
        localStorage.setItem("completedSessionId", sessionId);
      } catch (err) {
        console.error(err);
        setError("Stripe payment failed.");
      } finally {
        setIsProcessing(false);
      }
    };

    const fetchCODOrder = async () => {
      try {
        const res = await axios.get(`/orders/${orderId}`);

        setOrder(res.data.order);
        clearCart();
      } catch (err) {
        console.error(err);
        setError("Failed to load COD order.");
      } finally {
        setIsProcessing(false);
      }
    };

    if (sessionId) {
      fetchStripeOrder();
    } else if (orderId) {
      fetchCODOrder();
    } else {
      setError("Missing session_id or order_id in URL.");
      setIsProcessing(false);
    }
  }, [clearCart]);

  if (isProcessing) return <LoadingSpinner />;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div className="h-screen flex items-center justify-center px-4">
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        gravity={0.1}
        style={{ zIndex: 99 }}
        numberOfPieces={700}
        recycle={false}
      />
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden relative z-10">
        <div className="p-6 sm:p-8">
          <div className="flex justify-center">
            <CheckCircle className="text-blue-300 w-16 h-16 mb-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-blue-300 mb-2">
            Purchase Successful!
          </h1>
          <p className="text-gray-300 text-center mb-2">
            Thank you for your purchase. Your order is being processed.
          </p>
          <p className="text-blue-400 text-center text-sm mb-6">
            Please check your email for order details.
          </p>

          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Order Code</span>
              {order?.orderCode ? (
                <span className="text-sm font-semibold text-white">
                  #{order.orderCode}
                </span>
              ) : (
                <span className="text-sm italic text-gray-400">
                  Đang tạo mã đơn hàng...
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Estimated Delivery</span>
              {order?.createdAt ? (
                <span className="text-sm font-semibold text-white">
                  {new Date(
                    new Date(order.createdAt).getTime() + 10 * 86400000
                  ).toLocaleDateString("vi-VN")}{" "}
                  -{" "}
                  {new Date(
                    new Date(order.createdAt).getTime() + 13 * 86400000
                  ).toLocaleDateString("vi-VN")}
                </span>
              ) : (
                <span className="text-sm font-semibold text-blue-300">
                  Calculating...
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => navigate("/profile")}
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center"
            >
              <HandHeart className="mr-2" size={18} />
              Thanks for trusting us!
            </button>
            <Link
              to={"/"}
              className="w-full bg-gray-700 hover:bg-gray-600 text-blue-300 font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center"
            >
              Continue Shopping
              <ArrowRight className="ml-2" size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessPage;
