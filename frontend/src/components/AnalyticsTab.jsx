// import { motion } from "framer-motion";
// import { useEffect, useState } from "react";
// import axios from "../lib/axios";
// import { Users, Package, BadgeCent, ToyBrick } from "lucide-react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip as RechartsTooltip,
//   BarChart,
//   Bar,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";
// import LoadingSpinner from "./LoadingSpinner";
// import { useNavigate } from "react-router-dom";
// import { useUserStore } from "../stores/useUserStore";
// import { Doughnut } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   ArcElement,
//   Tooltip as ChartTooltip,
//   Legend as ChartLegend,
// } from "chart.js";

// ChartJS.register(ArcElement, ChartTooltip, ChartLegend);

// const categoryLabels = {
//   hg: "High Grade",
//   rg: "Real Grade",
//   mg: "Master Grade",
//   pg: "Perfect Grade",
//   sd: "Super Deformed",
//   tools: "Tools",
//   decal: "Paint & Decal",
//   other: "Other Product",
// };

// const AnalyticsTab = () => {
//   const { user } = useUserStore();
//   const navigate = useNavigate();

//   const [analyticsData, setAnalyticsData] = useState({
//     users: 0,
//     products: 0,
//     totalSales: 0,
//     totalRevenue: 0,
//   });
//   const [isLoading, setIsLoading] = useState(true);
//   const [dailySalesData, setDailySalesData] = useState([]);
//   const [userRoleStats, setUserRoleStats] = useState([]);
//   const [productRevenueData, setProductRevenueData] = useState([]);
//   const [categoryRevenueData, setCategoryRevenueData] = useState([]);
//   const [topCustomersData, setTopCustomersData] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [analyticsRes, roleRes, revenueRes, categoryRes, topCustomerRes] = await Promise.all([
//           axios.get("/analytics"),
//           axios.get("/analytics/user-role-stats"),
//           axios.get("/analytics/product-revenue"),
//           axios.get("/analytics/category-revenue"),
//           axios.get("/analytics/top-customers"),
//         ]);

//         setAnalyticsData(analyticsRes.data.analyticsData);
//         setDailySalesData(analyticsRes.data.dailySalesData);
//         setUserRoleStats(roleRes.data);
//         setProductRevenueData(revenueRes.data);
//         setCategoryRevenueData(categoryRes.data);
//         setTopCustomersData(topCustomerRes.data);
//       } catch (err) {
//         console.error("Lỗi khi tải dữ liệu phân tích:", err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   if (isLoading) return <LoadingSpinner />;

//   const recentDays = 30;
//   const trimmedData = dailySalesData.slice(-recentDays);

//   const doughnutChartData = {
//     labels: userRoleStats.map((item) => item.role),
//     datasets: [
//       {
//         label: "Users by Role",
//         data: userRoleStats.map((item) => item.count),
//         backgroundColor: ["#60A5FA", "#34D399", "#FBBF24", "#F87171"],
//         borderColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"],
//         borderWidth: 1,
//       },
//     ],
//   };

//   const categoryChartData = {
// 	labels: categoryRevenueData.map((item) => categoryLabels[item.category] || item.category),
// 	datasets: [
// 		{
// 		label: "Revenue by Category",
// 		data: categoryRevenueData.map((item) => item.totalRevenue),
// 		backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#0EA5E9", "#F43F5E", "#14B8A6"],
// 		borderColor: ["#2563EB", "#059669", "#D97706", "#DC2626", "#7C3AED", "#0284C7", "#BE123C", "#0F766E"],
// 		borderWidth: 1,
// 		},
// 	],
// 	};

// const doughnutChartOptions = {
//   responsive: true,
// //   plugins: {
// //     legend: {
// //       position: "bottom",
// //       labels: {
// //         color: "#ffffff",
// //         padding: 12,
// //         boxWidth: 12, // kích thước ô màu nhỏ gọn
// //         font: {
// //           size: 13,
// //         },
// //       },
// //     },
// //   },
// plugins: {
//   legend: {
//     display: false,
//   },
// },

//   layout: {
//     padding: {
//       top: 10,
//       bottom: 10,
//     },
//   },
// };

//   const CustomTooltip = ({ active, payload, label }) => {
//     if (active && payload && payload.length) {
//       const sales = payload.find((p) => p.dataKey === "sales")?.value ?? 0;
//       const revenue = payload.find((p) => p.dataKey === "revenue")?.value ?? 0;

//       return (
//         <div className="bg-white text-sm p-3 rounded shadow border">
//           <p className="text-gray-800 font-semibold mb-1">{label}</p>
//           <p className="text-green-600">Sales : {sales}</p>
//           <p className="text-blue-600">Revenue : ${Number(revenue).toFixed(2)}</p>
//         </div>
//       );
//     }
//     return null;
//   };

//   const CustomXAxisTick = ({ x, y, payload }) => {
//     if (!payload || !payload.payload) return null;
//     const { productImage, productName } = payload.payload;
//     return (
//       <foreignObject x={x - 20} y={y} width={60} height={80}>
//         <div className="flex flex-col items-center group relative">
//           <img
//             src={productImage}
//             alt={productName}
//             className="w-8 h-8 rounded-md object-cover shadow-md group-hover:scale-150 transition-transform duration-300 z-10"
//           />
//           <span className="absolute top-10 w-32 text-xs text-white text-center opacity-0 group-hover:opacity-100 bg-black bg-opacity-70 rounded p-1 transition-opacity">
//             {productName}
//           </span>
//         </div>
//       </foreignObject>
//     );
//   };

//   const CustomProductTooltip = ({ active, payload }) => {
//     if (active && payload && payload.length) {
//       const { productName, productImage, totalRevenue } = payload[0].payload;
//       return (
//         <div className="bg-white rounded shadow p-3 border w-48">
//           <img src={productImage} alt={productName} className="w-full h-24 object-contain mb-2" />
//           <p className="text-sm font-semibold text-gray-800">{productName}</p>
//           <p className="text-blue-600">Revenue: ${totalRevenue.toFixed(2)}</p>
//         </div>
//       );
//     }
//     return null;
//   };

//   const CustomCustomerTooltip = ({ active, payload }) => {
//   if (active && payload && payload.length) {
//     const data = payload[0].payload;

//     return (
//       <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-72 text-sm text-gray-800 space-y-2">
//         <div className="flex items-center space-x-2 border-b pb-2">
//           <span className="text-xl">👤</span>
//           <div className="font-semibold text-base">{data.fullName}</div>
//         </div>
//         <div className="flex items-center space-x-2">
//           <span className="text-blue-500">📧</span>
//           <span className="break-all">{data.email}</span>
//         </div>
//         <div className="flex items-center space-x-2">
//           <span className="text-green-500">📱</span>
//           <span>{data.phone || "N/A"}</span>
//         </div>
//         <div className="flex items-center space-x-2">
//           <span className="text-indigo-500">🛒</span>
//           <span>{data.orderCount} Orders</span>
//         </div>
//         <div className="flex items-center space-x-2">
//           <span className="text-yellow-500">💰</span>
//           <span>
//             Total Spent: <span className="font-medium">${Number(data.totalSpent).toLocaleString()}</span>
//           </span>
//         </div>
//       </div>
//     );
//   }

//   return null;
// };

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//       {/* Section 1: Tổng quan */}
//       <div className="grid gap-6 mb-8 grid-cols-[repeat(auto-fit,_minmax(240px,_1fr))]">
//         {user?.role === "admin" && (
//           <AnalyticsCard
//             title="Total Customers"
//             value={analyticsData.customers.toLocaleString()}
//             icon={Users}
//             color="from-yellow-400 to-yellow-600"
//             onClick={() => navigate("/admin/users_list")}
//           />
//         )}
//         <AnalyticsCard
//           title="Total Products"
//           value={analyticsData.products.toLocaleString()}
//           icon={ToyBrick}
//           color="from-red-500 to-rose-700"
//           onClick={() => navigate("/admin/products_list")}
//         />
//         <AnalyticsCard
//           title="Total Order"
//           value={analyticsData.totalSales.toLocaleString()}
//           icon={Package}
//           color="from-indigo-500 to-purple-700"
//           onClick={() => navigate("/admin/orders")}
//         />
//         <AnalyticsCard
//           title="Total Revenue"
//           value={`$${analyticsData.totalRevenue.toLocaleString()}`}
//           icon={BadgeCent}
//           color="from-emerald-500 to-green-700"
//         />
//       </div>

//       {/* Line Chart */}
//       <motion.div
//         className="bg-gray-900/60 rounded-lg p-6 shadow-lg mb-6"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5, delay: 0.25 }}
//       >
//         <h3 className="text-white text-xl font-semibold mb-4 text-center">Daily Sales & Revenue</h3>
//         <ResponsiveContainer width="100%" height={300}>
//           <LineChart data={trimmedData}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="date" stroke="#D1D5DB" />
//             <YAxis yAxisId="left" stroke="#D1D5DB" />
//             <YAxis yAxisId="right" orientation="right" stroke="#D1D5DB" />
//             <RechartsTooltip content={<CustomTooltip />} />
//             <Legend />
//             <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#22C55E" activeDot={{ r: 8 }} name="Sales" />
//             <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#3B82F6" activeDot={{ r: 8 }} name="Revenue" />
//           </LineChart>
//         </ResponsiveContainer>
//       </motion.div>

//       {/* Doughnut Charts */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <motion.div className="bg-gray-900/60 rounded-lg p-6 shadow-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
//           <h3 className="text-white text-xl font-semibold mb-4 text-center">User Role Distribution</h3>
//           <div className="flex justify-center">
//             <div className="w-full max-w-xs">
//               <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
//             </div>
//           </div>
// 		  <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
//     {doughnutChartData.labels.map((label, idx) => (
//       <div key={label} className="flex items-center space-x-2 text-sm text-white">
//         <div
//           className="w-3 h-3 rounded-full"
//           style={{
//             backgroundColor: doughnutChartData.datasets[0].backgroundColor[idx],
//           }}
//         />
//         <span>{label}</span>
//       </div>
//     ))}
//   </div>
//         </motion.div>
//         <motion.div className="bg-gray-900/60 rounded-lg p-6 shadow-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
//   <h3 className="text-white text-2xl font-semibold mb-4 text-center">Revenue by Category</h3>
//   <div className="flex flex-col items-center">
//   <div className="w-full max-w-sm">
//     <Doughnut data={categoryChartData} options={doughnutChartOptions} />
//   </div>
// </div>
// <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
//     {categoryChartData.labels.map((label, idx) => (
//       <div key={label} className="flex items-center space-x-2 text-sm text-white">
//         <div
//           className="w-3 h-3 rounded-full"
//           style={{
//             backgroundColor: categoryChartData.datasets[0].backgroundColor[idx],
//           }}
//         />
//         <span>{label}</span>
//       </div>
//     ))}
//   </div>
// </motion.div>

//       </div>

//       {/* Revenue by Product */}
//       <motion.div className="bg-gray-900/60 rounded-lg p-6 shadow-lg mt-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
//         <h3 className="text-white text-xl font-semibold mb-4 text-center">Revenue by Product</h3>
//         <ResponsiveContainer width="100%" height={400}>
//           <BarChart data={productRevenueData}>
//             <XAxis dataKey="productName" tick={CustomXAxisTick} />
//             <YAxis stroke="#D1D5DB" />
//             <RechartsTooltip content={<CustomProductTooltip />} />
//             <Legend />
//             <Bar dataKey="totalRevenue" fill="#60A5FA" name="Revenue ($)" />
//           </BarChart>
//         </ResponsiveContainer>
//       </motion.div>

//       {/* Top Customers */}
//       <motion.div className="bg-gray-900/60 rounded-lg p-6 shadow-lg mt-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }}>
//         <h3 className="text-white text-xl font-semibold mb-4 text-center">Top 5 Customers by Orders</h3>
//         <ResponsiveContainer width="100%" height={300}>
//           <BarChart data={topCustomersData} layout="vertical">
//             <XAxis type="number" stroke="#D1D5DB" />
//             <YAxis type="category" dataKey="fullName" stroke="#D1D5DB" width={150} />
//            	<RechartsTooltip content={CustomCustomerTooltip} />

//             <Legend />
//             <Bar dataKey="orderCount" fill="#34D399" name="Orders" />
//           </BarChart>
//         </ResponsiveContainer>
//       </motion.div>
//     </div>
//   );
// };

// export default AnalyticsTab;

// const AnalyticsCard = ({ title, value, icon: Icon, color, onClick }) => (
//   <motion.div
//     onClick={onClick}
//     whileHover={{ scale: 1.03 }}
//     whileTap={{ scale: 0.98 }}
//     className="cursor-pointer bg-gray-900 rounded-2xl p-6 shadow-lg overflow-hidden relative transition-all duration-300 group"
//     initial={{ opacity: 0, y: 20 }}
//     animate={{ opacity: 1, y: 0 }}
//     transition={{ duration: 0.5 }}
//   >
//     {/* Gradient Background Overlay */}
//     <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-70  group-hover:opacity-40 transition-all duration-300 rounded-2xl`} />

//     {/* Glow Border on hover */}
//     <div className={`absolute inset-0 rounded-2xl border border-transparent group-hover:border-[1.5px] group-hover:border-current group-hover:shadow-[0_0_20px] group-hover:shadow-current transition-all duration-300`} />

//     <div className="relative z-10 flex justify-between items-center">
//       <div>
//         <p className="text-white/70 text-sm mb-1 font-semibold">{title}</p>
//         <h3 className="text-white text-3xl font-bold">{value}</h3>
//       </div>
//       <Icon className="h-10 w-10 text-white group-hover:text-white transition duration-300" />
//     </div>
//   </motion.div>
// );

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import axios from "../lib/axios";
import { Users, Package, BadgeCent, ToyBrick, Download } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  Legend,
  ResponsiveContainer,
} from "recharts";
import LoadingSpinner from "./LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from "chart.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


ChartJS.register(ArcElement, ChartTooltip, ChartLegend);

const categoryLabels = {
  hg: "High Grade",
  rg: "Real Grade",
  mg: "Master Grade",
  pg: "Perfect Grade",
  sd: "Super Deformed",
  tools: "Tools",
  decal: "Paint & Decal",
  other: "Other Product",
};

const periodOptions = [
  { label: "1 Week", value: 7 },
  { label: "2 Weeks", value: 14 },
  { label: "1 Month", value: 30 },
];

const AnalyticsTab = () => {
  const { user } = useUserStore();
  const navigate = useNavigate();

  const [analyticsData, setAnalyticsData] = useState({
    users: 0,
    products: 0,
    totalSales: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true); // ban đầu cover toàn bộ
  const [dailySalesData, setDailySalesData] = useState([]);
  const [userRoleStats, setUserRoleStats] = useState([]);
  const [productRevenueData, setProductRevenueData] = useState([]);
  const [categoryRevenueData, setCategoryRevenueData] = useState([]);
  const [topCustomersData, setTopCustomersData] = useState([]);

  const [period, setPeriod] = useState(30); // preset mặc định
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const isCustomRange = !!(startDate && endDate);

  // loading riêng cho chart line
  const [isChartLoading, setIsChartLoading] = useState(false);

const debouncedPeriodRef = useRef(period);
const periodTimeoutRef = useRef(null);

  // fetch non-sales (role, product, category, top customers)
  const fetchNonSales = async () => {
    try {
      const [roleRes, revenueRes, categoryRes, topCustomerRes] =
        await Promise.all([
          axios.get("/analytics/user-role-stats"),
          axios.get("/analytics/product-revenue"),
          axios.get("/analytics/category-revenue"),
          axios.get("/analytics/top-customers"),
        ]);
      setUserRoleStats(roleRes.data);
      setProductRevenueData(revenueRes.data);
      setCategoryRevenueData(categoryRes.data);
      setTopCustomersData(topCustomerRes.data);
    } catch (err) {
      console.error("Lỗi khi tải các phần còn lại:", err);
    }
  };

  // fetch sales & summary with either days or custom range
  const fetchSalesAndSummary = async ({ days, start, end }) => {
    try {
      setIsChartLoading(true);
      let analyticsUrl = "/analytics";
      if (start && end) {
        analyticsUrl = `/analytics?start=${start}&end=${end}`;
      } else if (days) {
        analyticsUrl = `/analytics?days=${days}`;
      }

      const analyticsRes = await axios.get(analyticsUrl);
      setAnalyticsData(analyticsRes.data.analyticsData);
      setDailySalesData(analyticsRes.data.dailySalesData);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu sales & summary:", err);
    } finally {
      setIsChartLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchSalesAndSummary({ days: period }),
        fetchNonSales(),
      ]);
      setIsLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when preset period changes (debounced)
  useEffect(() => {
    if (periodTimeoutRef.current) {
      clearTimeout(periodTimeoutRef.current);
    }
    periodTimeoutRef.current = window.setTimeout(() => {
      debouncedPeriodRef.current = period;
      // clear custom range if switching preset
      setStartDate(null);
      setEndDate(null);
      fetchSalesAndSummary({ days: period });
    }, 300);
    return () => {
      if (periodTimeoutRef.current) clearTimeout(periodTimeoutRef.current);
    };
  }, [period]);

  // when apply custom range
  const handleCustomRangeApply = () => {
    if (!startDate || !endDate) return;
    const startStr = startDate.toISOString().split("T")[0];
    const endStr = endDate.toISOString().split("T")[0];
    // clear preset selection (so label shows custom)
    fetchSalesAndSummary({ start: startStr, end: endStr });
  };
  const exportDailySalesToXLSX = () => {
  if (!trimmedData.length) return;

  const dataToExport = trimmedData.map((item) => ({
    Date: format(new Date(item.date), "yyyy-MM-dd"),
    Sales: item.sales,
    Revenue: Number(item.revenue).toFixed(2),
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Daily Sales");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

  saveAs(blob, `Daily_Sales_${new Date().toISOString().slice(0, 10)}.xlsx`);
};


  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );

  // sort + fallback slicing nếu backend ko hỗ trợ range query
  const sortedSales = [...dailySalesData].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  let trimmedData = sortedSales.slice(-period);
  if (isCustomRange && startDate && endDate) {
    trimmedData = sortedSales.filter((d) => {
      const dt = new Date(d.date);
      return dt >= startDate && dt <= endDate;
    });
  }

  const doughnutChartData = {
    labels: userRoleStats.map((item) => item.role),
    datasets: [
      {
        label: "Users by Role",
        data: userRoleStats.map((item) => item.count),
        backgroundColor: ["#60A5FA", "#34D399", "#FBBF24", "#F87171"],
        borderColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"],
        borderWidth: 1,
      },
    ],
  };

  const categoryChartData = {
    labels: categoryRevenueData.map(
      (item) => categoryLabels[item.category] || item.category
    ),
    datasets: [
      {
        label: "Revenue by Category",
        data: categoryRevenueData.map((item) => item.totalRevenue),
        backgroundColor: [
          "#3B82F6",
          "#10B981",
          "#F59E0B",
          "#EF4444",
          "#8B5CF6",
          "#0EA5E9",
          "#F43F5E",
          "#14B8A6",
        ],
        borderColor: [
          "#2563EB",
          "#059669",
          "#D97706",
          "#DC2626",
          "#7C3AED",
          "#0284C7",
          "#BE123C",
          "#0F766E",
        ],
        borderWidth: 1,
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10,
      },
    },
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const sales = payload.find((p) => p.dataKey === "sales")?.value ?? 0;
      const revenue = payload.find((p) => p.dataKey === "revenue")?.value ?? 0;

      return (
        <div className="bg-white text-sm p-3 rounded shadow border">
          <p className="text-gray-800 font-semibold mb-1">{label}</p>
          <p className="text-green-600">Sales : {sales}</p>
          <p className="text-blue-600">
            Revenue : ${Number(revenue).toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomXAxisTick = ({ x, y, payload }) => {
    if (!payload || !payload.payload) return null;
    const { productImage, productName } = payload.payload;
    return (
      <foreignObject x={x - 20} y={y} width={60} height={80}>
        <div className="flex flex-col items-center group relative">
          <img
            src={productImage}
            alt={productName}
            className="w-8 h-8 rounded-md object-cover shadow-md group-hover:scale-150 transition-transform duration-300 z-10"
          />
          <span className="absolute top-10 w-32 text-xs text-white text-center opacity-0 group-hover:opacity-100 bg-black bg-opacity-70 rounded p-1 transition-opacity">
            {productName}
          </span>
        </div>
      </foreignObject>
    );
  };

  const CustomProductTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { productName, productImage, totalRevenue } = payload[0].payload;
      return (
        <div className="bg-white rounded shadow p-3 border w-48">
          <img
            src={productImage}
            alt={productName}
            className="w-full h-24 object-contain mb-2"
          />
          <p className="text-sm font-semibold text-gray-800">{productName}</p>
          <p className="text-blue-600">Revenue: ${totalRevenue.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  const CustomCustomerTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-72 text-sm text-gray-800 space-y-2">
          <div className="flex items-center space-x-2 border-b pb-2">
            <span className="text-xl">👤</span>
            <div className="font-semibold text-base">{data.fullName}</div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-blue-500">📧</span>
            <span className="break-all">{data.email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-500">📱</span>
            <span>{data.phone || "N/A"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-indigo-500">🛒</span>
            <span>{data.orderCount} Orders</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-yellow-500">💰</span>
            <span>
              Total Spent:{" "}
              <span className="font-medium">
                ${Number(data.totalSpent).toLocaleString()}
              </span>
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section 1: Tổng quan */}
      <div className="grid gap-6 mb-8 grid-cols-[repeat(auto-fit,_minmax(240px,_1fr))]">
        {user?.role === "admin" && (
          <AnalyticsCard
            title="Total Customers"
            value={analyticsData.customers?.toLocaleString() || "0"}
            icon={Users}
            color="from-yellow-400 to-yellow-600"
            onClick={() => navigate("/admin/users_list")}
          />
        )}
        <AnalyticsCard
          title="Total Products"
          value={analyticsData.products?.toLocaleString() || "0"}
          icon={ToyBrick}
          color="from-red-500 to-rose-700"
          onClick={() => navigate("/admin/products_list")}
        />
        <AnalyticsCard
          title="Total Order"
          value={analyticsData.totalSales?.toLocaleString() || "0"}
          icon={Package}
          color="from-indigo-500 to-purple-700"
          onClick={() => navigate("/admin/orders")}
        />
        <AnalyticsCard
          title="Total Revenue"
          value={`$${analyticsData.totalRevenue?.toLocaleString() || "0"}`}
          icon={BadgeCent}
          color="from-emerald-500 to-green-700"
        />
        
      </div>

      {/* Line Chart with period / custom range filter */}
      <motion.div
        className="bg-gray-900/60 rounded-lg p-6 shadow-lg mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-2 gap-4">
          <div className="flex flex-col">
            <h3 className="text-white text-xl font-semibold mb-1">
              Daily Sales & Revenue
            </h3>
            <p className="text-sm text-gray-300">
              {isCustomRange && startDate && endDate
                ? `Showing from ${format(startDate, "d MMM")} to ${format(
                    endDate,
                    "d MMM"
                  )}`
                : `Showing last ${period} day${period > 1 ? "s" : ""}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <button
  onClick={exportDailySalesToXLSX}
  className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-600 text-white text-sm font-medium hover:bg-green-500 transition"
>
  <Download className="w-4 h-4" />
  Export XLSX
</button>

            {periodOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setPeriod(opt.value);
                  setStartDate(null);
                  setEndDate(null);
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  !isCustomRange && period === opt.value
                    ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {opt.label}
              </button>
            ))}

            {/* Custom range picker */}
            <div className="flex items-center gap-2 bg-gray-800 rounded-full px-3 py-1">
              <DatePicker
                selected={startDate}
                onChange={(d) => {
                  setStartDate(d);
                  if (endDate && d && d > endDate) setEndDate(null);
                }}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Start"
                maxDate={new Date()}
                isClearable
                className="text-sm rounded px-2 py-1 bg-gray-700 text-white"
              />
              <span className="text-gray-400">to</span>
              <DatePicker
                selected={endDate}
                onChange={(d) => setEndDate(d)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                placeholderText="End"
                maxDate={new Date()}
                isClearable
                className="text-sm rounded px-2 py-1 bg-gray-700 text-white"
              />
              <button
                onClick={handleCustomRangeApply}
                disabled={!startDate || !endDate}
                className={`text-sm font-medium px-3 py-1 rounded-full transition ${
                  startDate && endDate
                    ? "bg-green-500 text-white"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                }`}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
        <div className="relative">
          {isChartLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-lg z-10">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white rounded-full animate-spin" />
                <span className="text-sm text-white">Updating chart...</span>
              </div>
            </div>
          )}
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trimmedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                stroke="#D1D5DB"
                tickFormatter={(str) => {
                  const d = new Date(str);
                  return format(d, "d MMM"); // "03/08" nếu muốn dd/MM thì: format(d, "dd/MM")
                }}
              />
              <YAxis yAxisId="left" stroke="#D1D5DB" />
              <YAxis yAxisId="right" orientation="right" stroke="#D1D5DB" />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="sales"
                stroke="#22C55E"
                activeDot={{ r: 8 }}
                name="Sales"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                activeDot={{ r: 8 }}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Doughnut Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          className="bg-gray-900/60 rounded-lg p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-white text-xl font-semibold mb-4 text-center">
            User Role Distribution
          </h3>
          <div className="flex justify-center">
            <div className="w-full max-w-xs">
              <Doughnut
                data={doughnutChartData}
                options={doughnutChartOptions}
              />
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
            {doughnutChartData.labels.map((label, idx) => (
              <div
                key={label}
                className="flex items-center space-x-2 text-sm text-white"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      doughnutChartData.datasets[0].backgroundColor[idx],
                  }}
                />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          className="bg-gray-900/60 rounded-lg p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-white text-2xl font-semibold mb-4 text-center">
            Revenue by Category
          </h3>
          <div className="flex flex-col items-center">
            <div className="w-full max-w-sm">
              <Doughnut
                data={categoryChartData}
                options={doughnutChartOptions}
              />
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
            {categoryChartData.labels.map((label, idx) => (
              <div
                key={label}
                className="flex items-center space-x-2 text-sm text-white"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      categoryChartData.datasets[0].backgroundColor[idx],
                  }}
                />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Revenue by Product */}
      <motion.div
        className="bg-gray-900/60 rounded-lg p-6 shadow-lg mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h3 className="text-white text-xl font-semibold mb-4 text-center">
          Revenue by Product
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={productRevenueData}>
            <XAxis dataKey="productName" tick={CustomXAxisTick} />
            <YAxis stroke="#D1D5DB" />
            <RechartsTooltip content={<CustomProductTooltip />} />
            <Legend />
            <Bar dataKey="totalRevenue" fill="#60A5FA" name="Revenue ($)" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Top Customers */}
      <motion.div
        className="bg-gray-900/60 rounded-lg p-6 shadow-lg mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <h3 className="text-white text-xl font-semibold mb-4 text-center">
          Top 5 Customers by Orders
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topCustomersData} layout="vertical">
            <XAxis type="number" stroke="#D1D5DB" />
            <YAxis
              type="category"
              dataKey="fullName"
              stroke="#D1D5DB"
              width={150}
            />
            <RechartsTooltip content={CustomCustomerTooltip} />
            <Legend />
            <Bar dataKey="orderCount" fill="#34D399" name="Orders" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default AnalyticsTab;

const AnalyticsCard = ({ title, value, icon: Icon, color, onClick }) => (
  <motion.div
    onClick={onClick}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.98 }}
    className="cursor-pointer bg-gray-900 rounded-2xl p-6 shadow-lg overflow-hidden relative transition-all duration-300 group"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    {/* Gradient Background Overlay */}
    <div
      className={`absolute inset-0 bg-gradient-to-br ${color} opacity-70  group-hover:opacity-40 transition-all duration-300 rounded-2xl`}
    />

    {/* Glow Border on hover */}
    <div
      className={`absolute inset-0 rounded-2xl border border-transparent group-hover:border-[1.5px] group-hover:border-current group-hover:shadow-[0_0_20px] group-hover:shadow-current transition-all duration-300`}
    />

    <div className="relative z-10 flex justify-between items-center">
      <div>
        <p className="text-white/70 text-sm mb-1 font-semibold">{title}</p>
        <h3 className="text-white text-3xl font-bold">{value}</h3>
      </div>
      <Icon className="h-10 w-10 text-white group-hover:text-white transition duration-300" />
    </div>
  </motion.div>
);
