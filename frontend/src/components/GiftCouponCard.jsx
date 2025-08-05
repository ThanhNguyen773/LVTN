// import { motion } from "framer-motion";
// import { useEffect, useState } from "react";
// import { useCartStore } from "../stores/useCartStore";

// const GiftCouponCard = () => {
// 	const [userInputCode, setUserInputCode] = useState("");
// 	const { coupon, isCouponApplied, applyCoupon, getMyCoupon, removeCoupon } = useCartStore();

// 	useEffect(() => {
// 		getMyCoupon();
// 	}, [getMyCoupon]);

// 	useEffect(() => {
// 		if (coupon) setUserInputCode(coupon.code);
// 	}, [coupon]);

// 	const handleApplyCoupon = () => {
// 		if (!userInputCode) return;
// 		applyCoupon(userInputCode);
// 	};

// 	const handleRemoveCoupon = async () => {
// 		await removeCoupon();
// 		setUserInputCode("");
// 	};

// 	return (
// 		<motion.div
// 			className='space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6'
// 			initial={{ opacity: 0, y: 20 }}
// 			animate={{ opacity: 1, y: 0 }}
// 			transition={{ duration: 0.5, delay: 0.2 }}
// 		>
// 			<div className='space-y-4'>
// 				<div>
// 					<label htmlFor='voucher' className='mb-2 block text-sm font-medium text-gray-300'>
// 						Nhập mã giảm giá
// 					</label>
// 					<input
// 						type='text'
// 						id='voucher'
// 						className='block w-full rounded-lg border border-gray-600 bg-gray-700 
//             p-2.5 text-sm text-white placeholder-gray-400 focus:border-blue-500 
//             focus:ring-blue-500'
// 						placeholder='Nhập mã ở đây'
// 						value={userInputCode}
// 						onChange={(e) => setUserInputCode(e.target.value)}
// 						required
// 					/>
// 				</div>

// 				<motion.button
// 					type='button'
// 					className='flex w-full items-center justify-center rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300'
// 					whileHover={{ scale: 1.05 }}
// 					whileTap={{ scale: 0.95 }}
// 					onClick={handleApplyCoupon}
// 				>
// 					Áp dụng mã
// 				</motion.button>
// 			</div>
// 			{isCouponApplied && coupon && (
// 				<div className='mt-4'>
// 					<h3 className='text-lg font-medium text-gray-300'>Mã được áp dụng</h3>

// 					<p className='mt-2 text-sm text-gray-400'>
// 						{coupon.code} - {coupon.discountPercentage}% off
// 					</p>

// 					<motion.button
// 						type='button'
// 						className='mt-2 flex w-full items-center justify-center rounded-lg bg-red-600 
//             px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 focus:outline-none
//              focus:ring-4 focus:ring-red-300'
// 						whileHover={{ scale: 1.05 }}
// 						whileTap={{ scale: 0.95 }}
// 						onClick={handleRemoveCoupon}
// 					>
// 						Loại bỏ giảm giá
// 					</motion.button>
// 				</div>
// 			)}

// 			{coupon && (
// 				<div className='mt-4'>
// 					<h3 className='text-lg font-medium text-gray-300'>Mã được áp dụng</h3>
// 					<p className='mt-2 text-sm text-gray-400'>
// 						{coupon.code} - {coupon.discountPercentage}% off
// 					</p>
// 				</div>
// 			)}
// 		</motion.div>
// 	);
// };
// export default GiftCouponCard;

// import { motion } from "framer-motion";
// import { useEffect, useState } from "react";
// import { useCartStore } from "../stores/useCartStore";

// const GiftCouponCard = () => {
// 	const [userInputCode, setUserInputCode] = useState("");
// 	const { coupon, isCouponApplied, applyCoupon, getMyCoupon, removeCoupon } = useCartStore();

// 	useEffect(() => {
// 		getMyCoupon();
// 	}, [getMyCoupon]);

// 	useEffect(() => {
// 		setUserInputCode(coupon?.code || "");
// 	}, [coupon]);

// 	const handleApplyCoupon = () => {
// 		if (!userInputCode.trim()) return;
// 		applyCoupon(userInputCode.trim());
// 	};

// 	const handleRemoveCoupon = async () => {
// 		await removeCoupon();
// 		setUserInputCode("");
// 	};

// 	return (
// 		<motion.div
// 			className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6"
// 			initial={{ opacity: 0, y: 20 }}
// 			animate={{ opacity: 1, y: 0 }}
// 			transition={{ duration: 0.5, delay: 0.2 }}
// 		>
// 			<div className="space-y-4">
// 				<div>
// 					<label htmlFor="voucher" className="mb-2 block text-sm font-medium text-gray-300">
// 						Coupon Code
// 					</label>
// 					<input
// 						type="text"
// 						id="voucher"
// 						placeholder="Enter code here"
// 						className="block w-full rounded-lg border border-gray-600 bg-gray-700 
// 							p-2.5 text-sm text-white placeholder-gray-400 focus:border-blue-500 
// 							focus:ring-blue-500"
// 						value={userInputCode}
// 						onChange={(e) => setUserInputCode(e.target.value)}
// 					/>
// 				</div>

// 				<motion.button
// 					type="button"
// 					className="flex w-full items-center justify-center rounded-lg bg-blue-500 
// 						px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 
// 						focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50"
// 					whileHover={{ scale: 1.05 }}
// 					whileTap={{ scale: 0.95 }}
// 					onClick={handleApplyCoupon}
// 					disabled={!userInputCode.trim()}
// 				>
// 					Apply Coupon
// 				</motion.button>
// 			</div>

// 			{coupon && (
// 				<div className="mt-4 space-y-2">
// 					<h3 className="text-lg font-medium text-gray-300">
// 						Coupon {isCouponApplied ? "applied" : "available"}:
// 					</h3>
// 					<p className="text-sm text-gray-400">
// 						{coupon.code} - {coupon.discountPercentage}% off
// 					</p>

// 					{isCouponApplied && (
// 						<motion.button
// 							type="button"
// 							className="mt-2 flex w-full items-center justify-center rounded-lg bg-red-600 
// 								px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 
// 								focus:outline-none focus:ring-4 focus:ring-red-300"
// 							whileHover={{ scale: 1.05 }}
// 							whileTap={{ scale: 0.95 }}
// 							onClick={handleRemoveCoupon}
// 						>
// 							Remove Coupon
// 						</motion.button>
// 					)}
// 				</div>
// 			)}
// 		</motion.div>
// 	);
// };

// export default GiftCouponCard;

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useCartStore } from "../stores/useCartStore";
import { useLocation } from "react-router-dom";

const GiftCouponCard = () => {
  const [userInputCode, setUserInputCode] = useState("");
  const { coupon, isCouponApplied, applyCoupon, getMyCoupon, removeCoupon } = useCartStore();
  const location = useLocation();

  useEffect(() => {
    getMyCoupon();
  }, [getMyCoupon]);

  useEffect(() => {
    setUserInputCode(coupon?.code || "");
  }, [coupon]);

  // Auto remove coupon when route changes
  useEffect(() => {
    if (isCouponApplied) {
      removeCoupon();
      setUserInputCode("");
    }
  }, [location.pathname]); // Mỗi khi URL thay đổi sẽ chạy

  const handleApplyCoupon = () => {
    if (!userInputCode.trim()) return;
    applyCoupon(userInputCode.trim());
  };

  const handleRemoveCoupon = async () => {
    await removeCoupon();
    setUserInputCode("");
  };

  return (
    <motion.div
      className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="voucher" className="mb-2 block text-sm font-medium text-gray-300">
            Coupon Code
          </label>
          <input
            type="text"
            id="voucher"
            placeholder="Enter code here"
            className="block w-full rounded-lg border border-gray-600 bg-gray-700 
              p-2.5 text-sm text-white placeholder-gray-400 focus:border-blue-500 
              focus:ring-blue-500"
            value={userInputCode}
            onChange={(e) => setUserInputCode(e.target.value)}
          />
        </div>

        <motion.button
          type="button"
          className="flex w-full items-center justify-center rounded-lg bg-blue-500 
            px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 
            focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleApplyCoupon}
          disabled={!userInputCode.trim()}
        >
          Apply Coupon
        </motion.button>
      </div>

      {coupon && (
        <div className="mt-4 space-y-2">
          <h3 className="text-lg font-medium text-gray-300">
            Coupon {isCouponApplied ? "applied" : "available"}:
          </h3>
          <p className="text-sm text-gray-400">
            {coupon.code} - {coupon.discountPercentage}% off
          </p>

          {isCouponApplied && (
            <motion.button
              type="button"
              className="mt-2 flex w-full items-center justify-center rounded-lg bg-red-600 
                px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 
                focus:outline-none focus:ring-4 focus:ring-red-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRemoveCoupon}
            >
              Remove Coupon
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default GiftCouponCard;
