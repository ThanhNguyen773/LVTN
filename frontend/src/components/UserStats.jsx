import { useEffect, useState } from "react";
import { useUserStore } from "../stores/useUserStore";
import { motion } from "framer-motion";
import { Users, UserPlus, TrendingUp } from "lucide-react";

export default function UserStats() {
  const { users, fetchAllUsers } = useUserStore();

  const [stats, setStats] = useState({
    total: 0,
    totalLastWeek: 0,
    newUsers: 0,
    newUsersLastMonth: 0,
    roles: {
      admin: 0,
      staff: 0,
      customer: 0,
    },
  });

  useEffect(() => {
    fetchAllUsers();
  }, []);

useEffect(() => {
  const now = new Date();

  // Tuần trước
  const lastWeek = new Date(now);
  lastWeek.setDate(now.getDate() - 7);

  // Tháng này
  const lastMonthStart = new Date(now);
  lastMonthStart.setMonth(now.getMonth() - 1);

  // Tháng trước nữa
  const prevMonthStart = new Date(now);
  prevMonthStart.setMonth(now.getMonth() - 2);

  const total = users.length;
  const totalLastWeek = users.filter(
    (u) => new Date(u.createdAt) < lastWeek
  ).length;

  // Người dùng mới trong tháng này
  const newUsers = users.filter(
    (u) => new Date(u.createdAt) >= lastMonthStart
  ).length;

  // Người dùng mới trong tháng trước
  const newUsersLastMonth = users.filter(
    (u) =>
      new Date(u.createdAt) >= prevMonthStart &&
      new Date(u.createdAt) < lastMonthStart
  ).length;

  const roles = {
    admin: users.filter((u) => u.role === "admin").length,
    staff: users.filter((u) => u.role === "staff").length,
    customer: users.filter((u) => u.role === "customer").length,
  };

  setStats({
    total,
    totalLastWeek,
    newUsers,
    newUsersLastMonth,
    roles,
  });
}, [users]);


  const percentChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  const roleTotal = stats.roles.admin + stats.roles.staff + stats.roles.customer;

  const rolePercent = {
    admin: (stats.roles.admin / roleTotal) * 100 || 0,
    staff: (stats.roles.staff / roleTotal) * 100 || 0,
    customer: (stats.roles.customer / roleTotal) * 100 || 0,
  };

  const roleColors = {
    admin: "bg-red-500",
    staff: "bg-yellow-500",
    customer: "bg-green-500",
  };

  const statsData = [
    {
      label: "Total Users",
      value: stats.total,
      change: percentChange(stats.total, stats.totalLastWeek),
      icon: <Users className="h-10 w-10 text-white" />,
      bg: "bg-gradient-to-r from-green-800 to-green-600",
      note: "this week",
    },
    {
      label: "New Users",
      value: stats.newUsers,
      change: percentChange(stats.newUsers, stats.newUsersLastMonth),
      icon: <UserPlus className="h-10 w-10 text-white" />,
      bg: "bg-gradient-to-r from-blue-800 to-blue-600",
      note: "this month",
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 mt-6 w-full">
      {/* Cards */}
      <div className="flex flex-col sm:flex-row gap-4 flex-1">
        {statsData.map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.04 }}
            className={`${stat.bg} rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-4 w-full`}
          >
            <div className="p-2 bg-white/10 rounded-xl">{stat.icon}</div>
            <div>
              <p className="text-sm text-white/80">{stat.label}</p>
              <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
              <div className="flex items-center gap-1 mt-1 text-xs text-lime-300 font-medium">
                <TrendingUp className="w-4 h-4" />
                {stat.change}% {stat.note}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Role Distribution */}
    <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-5 shadow-md w-full flex-[1.2]">
        <h4 className="text-white text-lg font-semibold mb-3">User Roles Distribution</h4>
        <div className="w-full h-6 bg-gray-700 rounded-full overflow-hidden flex text-white text-xs font-semibold">
          {["admin", "staff", "customer"].map((role) => (
            <div
              key={role}
              className={`${roleColors[role]} flex items-center justify-center`}
              style={{ width: `${rolePercent[role]}%` }}
            >
              {stats.roles[role] > 0 && (
                <span className="px-1">
                  {Math.round(rolePercent[role])}%
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm text-gray-300 mt-3">
          <span>Admin: {stats.roles.admin}</span>
          <span>Staff: {stats.roles.staff}</span>
          <span>Customer: {stats.roles.customer}</span>
        </div>
      </div>
    </div>
  );
}
