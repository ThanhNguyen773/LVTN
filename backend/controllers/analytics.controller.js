import { get } from "mongoose";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

export const getAnalyticsData = async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();

    const salesData = await Order.aggregate([
        {
            $group: {
                _id: null,
                totalSales: { $sum:1 },
                totalRevenue: { $sum:"$totalAmount" },
            },
        },
    ]);

    const {totalSales, totalRevenue} = salesData[0] || {totalSales: 0, totalRevenue: 0};

    return {
        users: totalUsers,
        products: totalProducts,
        totalSales,
        totalRevenue,
    }
};

export const getDailySalesData = async (startDate, endDate) => {
    try {
        const dailySalesData = await Order.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startDate,
                    $lt: endDate,
                },
            },
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                totalSales: { $sum: 1 },
                totalRevenue: { $sum: "$totalAmount" },
            },
        },
        {
            $sort: { _id: 1 }, // Sort by date
        },
    ]);
    //example output: [{_id: "2023-10-01", totalSales: 5, totalRevenue: 100}, {...}, ...]
        const dateArray = getDatesInRange(startDate, endDate);

        return dateArray.map(date => {
            const foundData = dailySalesData.find(item => item._id === date);

            return {
                date,
                sales: foundData?.sales || 0,
                revenue: foundData?.revenue || 0,
            }
        });
    } catch (error) {
       throw error; 
    }
};

function getDatesInRange(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().split("T")[0]); // Format as YYYY-MM-DD
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
}