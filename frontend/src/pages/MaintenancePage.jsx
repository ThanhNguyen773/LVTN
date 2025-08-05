import { Wrench, AlertTriangle, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";

const MaintenancePage = ({
  message = "We’re currently performing scheduled maintenance. Please come back later.",
  setting,
}) => {
  const navigate = useNavigate();
  const { logout } = useUserStore();

  const handleLogoutAndLogin = async () => {
    await logout();
    navigate("/login");
  };

  const storeName = setting?.storeName || "Gundam Store";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 text-white">
      <motion.div
        className="max-w-md w-full text-center space-y-6"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-center">
          <div className="bg-yellow-600/20 p-4 rounded-full">
            <Wrench className="w-12 h-12 text-yellow-400 animate-spin-slow" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-yellow-400">
          Under Maintenance
        </h1>
        <p className="text-gray-300">{message}</p>

        <div className="bg-gray-700/30 text-sm p-4 rounded-lg flex items-start gap-3 border border-yellow-600/40 text-left">
          <AlertTriangle className="w-5 h-5 text-yellow-300 mt-1" />
          <div>
            <p className="text-yellow-300 font-semibold">
              This site is temporarily unavailable
            </p>
            <p>
              Only admin accounts can access during maintenance. You may log out
              and sign in as an administrator.
            </p>
          </div>
        </div>

        {/* Nút Logout & Login */}
        <button
          onClick={handleLogoutAndLogin}
          className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 px-6 py-3 rounded-full font-semibold text-white shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
          <span>Logout & Login as Admin</span>
        </button>

        <p className="text-xs text-gray-500 mt-6">
          {storeName} © {new Date().getFullYear()} | Powered by ThanhB2110100
        </p>
      </motion.div>
    </div>
  );
};

export default MaintenancePage;
