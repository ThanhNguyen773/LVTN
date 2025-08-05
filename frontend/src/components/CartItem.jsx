// import { Minus, Plus, Trash } from "lucide-react";
// import { useCartStore } from "../stores/useCartStore";
// import { Link } from "react-router-dom";

// const CartItem = ({ item }) => {
// 	const { removeFromCart, updateQuantity } = useCartStore();

// 	return (
// 		<div className='rounded-lg border p-4 shadow-sm border-gray-700 bg-gray-800 md:p-6'>
// 			<div className='space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0'>
// 				{/* Hình ảnh sản phẩm */}
// 				<div className='shrink-0 md:order-1'>
// 					<img
// 						className='h-20 md:h-32 rounded object-cover'
// 						src={item.image}
// 						alt={item.name}
// 					/>
// 				</div>

// 				{/* Tên, mô tả và nút xóa */}
// 				<div className='w-full min-w-0 flex-1 space-y-4 md:order-2 md:max-w-md'>
// 					<Link
//            			 to={`/products/${item._id}`} className='text-base font-medium text-white hover:text-blue-400 hover:underline'>
// 						{item.name}
// 					</Link>
					

// 					<div className='flex items-center gap-4'>
// 						<button
// 							className='inline-flex items-center text-sm font-medium text-red-400 hover:text-red-300 hover:underline'
// 							onClick={() => removeFromCart(item._id)}
// 						>
// 							<Trash />
// 						</button>
// 					</div>
// 				</div>

// 				{/* Số lượng + Đơn giá + Tổng */}
// 				<div className='flex items-center justify-between md:order-3 md:justify-end gap-6'>
// 					{/* Số lượng */}
// 					<div className='flex items-center gap-2'>
// 						<button
// 							className='inline-flex h-6 w-6 items-center justify-center rounded-md border border-gray-600 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400'
// 							onClick={() => updateQuantity(item._id, item.quantity - 1)}
// 						>
// 							<Minus className='text-gray-300' size={16} />
// 						</button>
// 						<p className='w-6 text-center text-white'>{item.quantity}</p>
// 						<button
// 							className='inline-flex h-6 w-6 items-center justify-center rounded-md border border-gray-600 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400'
// 							onClick={() => updateQuantity(item._id, item.quantity + 1)}
// 						>
// 							<Plus className='text-gray-300' size={16} />
// 						</button>
// 					</div>

// 					{/* Giá */}
// 					<div className='text-end space-y-1'>
// 						<div>
// 							<p className='text-sm text-gray-400'>Unit price</p>
// 							<p className='text-base font-semibold text-blue-400'>${item.price}</p>
// 						</div>
// 						<div>
// 							<p className='text-sm text-gray-400'>Total</p>
// 							<p className='text-base font-bold text-white'>
// 								${(item.price * item.quantity).toFixed(2)}
// 							</p>
// 						</div>
// 					</div>
// 				</div>
// 			</div>
// 		</div>
// 	);
// };

// export default CartItem;

import { Minus, Plus, Trash } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import { Link } from "react-router-dom";

const CartItem = ({ item, readOnly = false }) => {
  const { removeFromCart, updateQuantity } = useCartStore();

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 shadow-sm p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Hình ảnh sản phẩm */}
        <div className="shrink-0">
          <img
            className="h-20 w-20 md:h-28 md:w-28 rounded-lg object-cover"
            src={item.image}
            alt={item.name}
          />
        </div>

        {/* Thông tin sản phẩm */}
        <div className="flex-1 min-w-0">
          <Link
            to={`/products/${item._id}`}
            className="text-base font-semibold text-white hover:text-blue-400 hover:underline line-clamp-2"
          >
            {item.name}
          </Link>

          {!readOnly && (
            <button
              className="mt-2 inline-flex items-center text-sm text-red-400 hover:text-red-300"
              onClick={() => removeFromCart(item._id)}
            >
              <Trash size={16} className="mr-1" />
              Remove
            </button>
          )}
        </div>

        {/* Số lượng + Giá */}
        <div className="flex flex-col items-end gap-2">
          
          {/* Số lượng */}
          {!readOnly ? (
            <div className="flex items-center gap-2">
              <button
                className="h-7 w-7 flex items-center justify-center rounded-md border border-gray-600 bg-gray-700 hover:bg-gray-600"
                onClick={() => updateQuantity(item._id, item.quantity - 1)}
              >
                <Minus size={14} className="text-gray-300" />
              </button>
              <p className="w-6 text-center text-white">{item.quantity}</p>
              <button
                className="h-7 w-7 flex items-center justify-center rounded-md border border-gray-600 bg-gray-700 hover:bg-gray-600"
                onClick={() => updateQuantity(item._id, item.quantity + 1)}
              >
                <Plus size={14} className="text-gray-300" />
              </button>
            </div>
          ) : (
            <p className="text-white font-medium">x{item.quantity}</p>
          )}

          {/* Giá */}
          <div className="text-right">
            <p className="text-sm text-gray-400">Unit price</p>
            <p className="text-base font-semibold text-blue-400">
              ${item.price}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Total</p>
            <p className="text-base font-bold text-white">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
