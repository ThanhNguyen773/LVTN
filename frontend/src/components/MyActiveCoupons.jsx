import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { Copy, Check, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

const MyActiveCoupon = () => {
  const [coupons, setCoupons] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await axios.get("/coupons/user/actives");
        setCoupons(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to fetch active coupons", error);
      }
    };

    fetchCoupons();
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied code: ${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isExpiringSoon = (expirationDate) => {
    const now = new Date();
    const expiry = new Date(expirationDate);
    const diffInDays = (expiry - now) / (1000 * 60 * 60 * 24);
    return diffInDays <= 3;
  };

  if (coupons.length === 0) return null;

  return (
    <div className="space-y-4">
      {coupons.map((coupon) => {
        const expiringSoon = isExpiringSoon(coupon.expirationDate);

        return (
          <div
            key={coupon._id}
            className="relative flex items-center justify-between rounded-lg border border-green-500 bg-green-100 p-4 text-sm text-green-900"
            onDoubleClick={() => handleCopy(coupon.code)}
          >
            <div>
              🎉 Coupon: <strong>{coupon.code}</strong> – {coupon.discountPercentage}% off
              (expires on{" "}
              {new Date(coupon.expirationDate).toLocaleDateString("en-GB")})
              {expiringSoon && (
                <span
                  className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-yellow-200 text-yellow-900 font-semibold border border-yellow-400"
                  title="This coupon is expiring soon!"
                >
                  <AlertTriangle size={14} /> Expiring Soon
                </span>
              )}
            </div>

            <button
              onClick={() => handleCopy(coupon.code)}
              className="ml-4 text-green-700 hover:text-green-900 transition"
              title="Copy code"
            >
              {copiedCode === coupon.code ? (
                <Check className="w-5 h-5" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default MyActiveCoupon;
