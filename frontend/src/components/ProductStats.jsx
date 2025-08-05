import { useEffect, useState } from "react";
import { useProductStore } from "../stores/useProductStore";
import {
  Star,
  ShoppingCart,
  Box,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";

export default function ProductStats() {
  const { products, fetchAllProducts } = useProductStore();
  const [stats, setStats] = useState({
    total: 0,
    totalSold: 0,
    isFeatured: 0,
    active: 0,
    inactive: 0,
  });

  useEffect(() => {
    fetchAllProducts();
  }, []);

  useEffect(() => {
    const total = products.length;
    const totalSold = products.reduce((sum, p) => sum + (p.sold || 0), 0);
    const featured = products.filter((p) => p.isFeatured).length;
    const active = products.filter((p) => p.isActive).length;
    const inactive = total - active;

    setStats({ total, totalSold, featured, active, inactive });
  }, [products]);

  const cardVariants = {
    whileHover: { scale: 1.05 },
  };

const statsData = [
  {
    label: "Total Products",
    value: stats.total,
    icon: <Box className="h-10 w-10 text-orange-400" />,
    bg: "bg-gradient-to-r from-slate-800 to-slate-700",
    text: "text-orange-300",
  },
  {
    label: "Sold Units",
    value: stats.totalSold,
    icon: <ShoppingCart className="h-10 w-10 text-green-400" />,
    bg: "bg-gradient-to-r from-green-800 to-green-700",
    text: "text-green-200",
  },
  {
    label: "Featured",
    value: stats.featured,
    icon: <Star className="h-10 w-10 text-yellow-400" />,
    bg: "bg-gradient-to-r from-yellow-700 to-yellow-600",
    text: "text-yellow-200",
  },
  {
    label: "Available",
    value: stats.active,
    icon: <CheckCircle className="h-10 w-10 text-blue-400" />,
    bg: "bg-gradient-to-r from-blue-800 to-blue-700",
    text: "text-blue-200",
  },
  {
    label: "Unavailable",
    value: stats.inactive,
    icon: <XCircle className="h-10 w-10 text-red-400" />,
    bg: "bg-gradient-to-r from-red-800 to-red-700",
    text: "text-red-200",
  },
];


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full mt-4">
      {statsData.map((stat, idx) => (
        <motion.div
  key={idx}
  whileHover={cardVariants.whileHover}
  className={`${stat.bg} rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-4`}
>
  <div className="p-2 bg-white/10 rounded-xl">
    {stat.icon}
  </div>
  <div>
    <p className={`text-sm ${stat.text}`}>{stat.label}</p>
    <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
  </div>
</motion.div>

      ))}
    </div>
  );
}
