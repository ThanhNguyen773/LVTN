import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

export const getAnalyticsData = async () => {
	const totalUsers = await User.countDocuments();
  const totalCustomers = await User.countDocuments({ role: "customer" });
	const totalProducts = await Product.countDocuments();

	const salesData = await Order.aggregate([
		{
			$group: {
				_id: null, // it groups all documents together,
				totalSales: { $sum: 1 },
				totalRevenue: { $sum: "$totalAmount" },
			},
		},
	]);

	const { totalSales, totalRevenue } = salesData[0] || { totalSales: 0, totalRevenue: 0 };

	return {
    customers: totalCustomers,
		users: totalUsers,
		products: totalProducts,
		totalSales,
		totalRevenue,
	};
};

export const getDailySalesData = async (startDate, endDate) => {
	try {
		const dailySalesData = await Order.aggregate([
			{
				$match: {
					createdAt: {
						$gte: startDate,
						$lte: endDate,
					},
				},
			},
			{
				$group: {
					_id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
					sales: { $sum: 1 },
					revenue: { $sum: "$totalAmount" },
				},
			},
			{ $sort: { _id: 1 } },
		]);


		const dateArray = getDatesInRange(startDate, endDate);
		// console.log(dateArray) // ['2024-08-18', '2024-08-19', ... ]

		return dateArray.map((date) => {
			const foundData = dailySalesData.find((item) => item._id === date);

			return {
				date,
				sales: foundData?.sales || 0,
				revenue: foundData?.revenue || 0,
			};
		});
	} catch (error) {
		throw error;
	}
};

function getDatesInRange(startDate, endDate) {
	const dates = [];
	let currentDate = new Date(startDate);

	while (currentDate <= endDate) {
		dates.push(currentDate.toISOString().split("T")[0]);
		currentDate.setDate(currentDate.getDate() + 1);
	}

	return dates;
};

// Thống kê số lượng người dùng theo vai trò
export const getUserRoleStats = async () => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: "$role", // gom theo vai trò
        count: { $sum: 1 },
      },
    },
  ]);

  return stats.map((item) => ({
    role: item._id,
    count: item.count,
  }));
};

export const getProductRevenueStats = async (req, res) => {
  try {
    const result = await Order.aggregate([
      { $unwind: "$products" }, 
      {
        $group: {
          _id: "$products.product",
          totalRevenue: {
            $sum: {
              $multiply: ["$products.quantity", "$products.price"],
            },
          },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
		$project: {
			_id: 0,
			productName: "$product.name",
			productImage: "$product.image", 
			totalRevenue: 1,
		},
		},

      { $sort: { totalRevenue: -1 } },
    ]);

    res.json(result);
  } catch (error) {
    console.error("Error fetching product revenue stats", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getTopCustomers = async (req, res) => {
  try {
    const topCustomers = await Order.aggregate([
      // Bước 1: Gom nhóm theo người dùng
      {
        $group: {
          _id: "$user",
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
        },
      },
      // Bước 2: Sắp xếp theo số đơn hàng giảm dần
      {
        $sort: { orderCount: -1 },
      },
      // Bước 3: Giới hạn 5 người đầu tiên
      {
        $limit: 5,
      },
      // Bước 4: Join sang bảng User để lấy thông tin
      {
        $lookup: {
          from: "users", // tên collection (luôn viết thường và số nhiều)
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $unwind: "$userInfo",
      },
      // Bước 5: Lấy các trường cần thiết
      {
        $project: {
          _id: 0,
          fullName: "$userInfo.name",
          email: "$userInfo.email",
          phone: "$userInfo.phone",
          orderCount: 1,
          totalSpent: 1,
        },
      },
    ]);

    res.status(200).json(topCustomers);
  } catch (error) {
    console.error("Lỗi khi lấy top khách hàng:", error);
    res.status(500).json({ message: "Lỗi server khi lấy top khách hàng" });
  }
};

// Lấy Doanh thu theo danh mục sản phẩm
export const getCategoryRevenueStats = async (req, res) => {
  try {
    const revenueByCategory = await Order.aggregate([
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.category",
          totalRevenue: {
            $sum: {
              $multiply: ["$products.quantity", "$products.price"],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalRevenue: 1,
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    res.status(200).json(revenueByCategory);
  } catch (err) {
    console.error("Lỗi khi tính doanh thu theo danh mục:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
