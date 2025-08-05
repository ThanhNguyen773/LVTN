import { ShoppingCart, ChevronDown, ChevronUp } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import CartItem from "../components/CartItem";
import PeopleAlsoBought from "../components/PeopleAlsoBought";
import OrderSummary from "../components/OrderSummary";
import GiftCouponCard from "../components/GiftCouponCard";
import MyActiveCoupons from "../components/MyActiveCoupons";
import { useState, useEffect, useRef } from "react";
import Breadcrumb from "../components/Breadcrumb";
import SimpleCartSummary from "../components/SimpleCartSummary";

const CartPage = () => {
  const { cart } = useCartStore();
  const [shipping, setShipping] = useState({
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    country: "",
  });
  const [note, setNote] = useState("");
  const [isShippingOpen, setIsShippingOpen] = useState(true);
  const [isCouponsOpen, setIsCouponsOpen] = useState(true);
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Cart" },
  ];

  useEffect(() => {
    localStorage.setItem("shippingAddress", JSON.stringify(shipping));
    localStorage.setItem("orderNote", note);
  }, [shipping, note]);

  return (
    <div className="py-8 md:py-10">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <motion.div
          className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="text-center text-3xl sm:text-5xl font-bold text-blue-300 mt-2">
            Your Shopping Cart
          </h1>
        </motion.div>

        <div className="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
          <motion.div
            className="mx-auto w-full flex-none lg:max-w-2xl xl:max-w-4xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {cart.length === 0 ? (
              <EmptyCartUI />
            ) : (
              <div className="space-y-6">
                {cart.map((item) => (
                  <CartItem key={item._id} item={item} />
                ))}
              </div>
            )}
          </motion.div>

          {cart.length > 0 && (
            <motion.div
              className="mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-full"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {/* <OrderSummary /> */}
              <SimpleCartSummary />

              {/* <div className="space-y-4">
                <GiftCouponCard />

                <div className="bg-gray-800 rounded-lg overflow-hidden text-white">
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                    onClick={() => setIsCouponsOpen((o) => !o)}
                  >
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold">My Active Coupons</h2>
                    </div>
                    <div className="flex items-center gap-1">
                      {isCouponsOpen ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                  <div
                    className={`px-4 pb-4 transition-[max-height,opacity] duration-300 overflow-hidden ${
                      isCouponsOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <MyActiveCoupons />
                  </div>
                </div>

                <div className="bg-gray-800 p-0 rounded-lg text-white">
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                    onClick={() => setIsShippingOpen((o) => !o)}
                  >
                    <h2 className="text-lg font-semibold">Shipping Information</h2>
                    {isShippingOpen ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                  <div
                    className={`px-4 pt-0 pb-4 transition-[max-height,opacity] duration-300 overflow-hidden ${
                      isShippingOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="space-y-3 mt-1">
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
                  </div>
                </div>
              </div> */}
            </motion.div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="mt-12">
            <PeopleAlsoBought />
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;

const EmptyCartUI = () => (
  <motion.div
    className="flex flex-col items-center justify-center space-y-4 py-16"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <ShoppingCart className="h-24 w-24 text-gray-300" />
    <h3 className="text-2xl font-semibold ">Your cart is empty</h3>
    <p className="text-gray-400">
      Maybe you haven't added any products to your cart yet.
    </p>
    <Link
      className="mt-4 rounded-md bg-blue-400 px-6 py-2 text-white transition-colors hover:bg-blue-600"
      to="/"
    >
      Start Shopping
    </Link>
  </motion.div>
);
