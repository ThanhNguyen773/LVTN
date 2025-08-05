import { useCartStore } from "../stores/useCartStore";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CartItem from "../components/CartItem";
import OrderSummary from "../components/OrderSummary";
import GiftCouponCard from "../components/GiftCouponCard";
import MyActiveCoupons from "../components/MyActiveCoupons";
import { ChevronDown, ChevronUp, Home } from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";

const CheckoutPage = () => {
  const { cart } = useCartStore();

  const [shipping, setShipping] = useState(() => {
    const saved = localStorage.getItem("shippingAddress");
    return saved
      ? JSON.parse(saved)
      : {
          phone: "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          postalCode: "",
          country: "",
        };
  });
  const [note, setNote] = useState(() => localStorage.getItem("orderNote") || "");

  const [isShippingOpen, setIsShippingOpen] = useState(true);
  const [isCouponsOpen, setIsCouponsOpen] = useState(true);
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Cart", href: "/cart"  },
    { label: "Checkout" },
  ];

  useEffect(() => {
    localStorage.setItem("shippingAddress", JSON.stringify(shipping));
    localStorage.setItem("orderNote", note);
  }, [shipping, note]);

  if (cart.length === 0) {
    return (
      <div className="py-16 text-center text-white">
        <p className="mb-4">Your cart is empty.</p>
        <Link
          to="/"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-10 max-w-screen-xl mx-auto px-4 2xl:px-0 text-white">

        <Breadcrumb items={breadcrumbItems} />
      <h1 className="text-center text-3xl sm:text-5xl font-bold text-blue-300 mt-2 mb-10">
            Your Checkout
          </h1>

      <div className="lg:flex lg:items-start gap-8">
        {/* LEFT */}
        <div className="flex-1 space-y-6">
          {/* Shipping Info */}
          <div className="bg-gray-800 rounded-lg">
            <div
              className="flex items-center justify-between px-4 py-3 border-b border-gray-700 cursor-pointer select-none"
              onClick={() => setIsShippingOpen((prev) => !prev)}
            >
              <h2 className="text-xl font-bold">Shipping Information</h2>
              {isShippingOpen ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
            {isShippingOpen && (
              <div className="p-4 space-y-3">
                <input
                  type="text"
                  placeholder="Phone"
                  className="w-full p-2 rounded bg-gray-700"
                  value={shipping.phone}
                  onChange={(e) =>
                    setShipping({ ...shipping, phone: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Address Line 1"
                  className="w-full p-2 rounded bg-gray-700"
                  value={shipping.addressLine1}
                  onChange={(e) =>
                    setShipping({ ...shipping, addressLine1: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Address Line 2 (optional)"
                  className="w-full p-2 rounded bg-gray-700"
                  value={shipping.addressLine2}
                  onChange={(e) =>
                    setShipping({ ...shipping, addressLine2: e.target.value })
                  }
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="City"
                    className="w-full p-2 rounded bg-gray-700"
                    value={shipping.city}
                    onChange={(e) =>
                      setShipping({ ...shipping, city: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Postal Code"
                    className="w-full p-2 rounded bg-gray-700"
                    value={shipping.postalCode}
                    onChange={(e) =>
                      setShipping({ ...shipping, postalCode: e.target.value })
                    }
                  />
                </div>
                <input
                  type="text"
                  placeholder="Country"
                  className="w-full p-2 rounded bg-gray-700"
                  value={shipping.country}
                  onChange={(e) =>
                    setShipping({ ...shipping, country: e.target.value })
                  }
                />
                <textarea
                  placeholder="Order note (optional)"
                  className="w-full p-2 rounded bg-gray-700"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Cart Items */}
          <div className="bg-gray-800 p-4 rounded-lg space-y-4">
            <h2 className="text-xl font-bold">Your Items</h2>
            {cart.map((item) => (
              <CartItem key={item._id} item={item} readOnly={true} />
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:w-96 space-y-6 mt-8 lg:mt-0">
          <OrderSummary />
          <GiftCouponCard />

          {/* My Active Coupons collapsible */}
          <div className="bg-gray-800 rounded-lg">
            <div
              className="flex items-center justify-between px-4 py-3 border-b border-gray-700 cursor-pointer select-none"
              onClick={() => setIsCouponsOpen((prev) => !prev)}
            >
              <h2 className="text-lg font-semibold">My Active Coupons</h2>
              {isCouponsOpen ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
            {isCouponsOpen && <div className="p-4"><MyActiveCoupons /></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
