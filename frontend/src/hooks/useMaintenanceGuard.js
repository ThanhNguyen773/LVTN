// hooks/useMaintenanceGuard.js
import { useEffect, useState } from "react";
import { useSettingStore } from "../stores/useSettingStore";
import { useUserStore } from "../stores/useUserStore";

export function useMaintenanceGuard() {
  const { setting, fetchSetting } = useSettingStore();
  const { user, checkAuth, checkingAuth } = useUserStore();
  const [ready, setReady] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const init = async () => {
      await checkAuth(); // đảm bảo user được nạp
      await fetchSetting();
      setReady(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const maintenanceActive = setting?.maintenanceMode?.isActive;
    const role = user?.role || "customer";
    const isAdminOrStaff = role === "admin" || role === "staff";
    if (maintenanceActive && !isAdminOrStaff) {
      setBlocked(true);
    } else {
      setBlocked(false);
    }
  }, [ready, setting, user]);

  return {
    blocked,
    message: setting?.maintenanceMode?.message,
    isAdminOrStaff: user?.role === "admin" || user?.role === "staff",
    ready,
    checkingAuth: checkingAuth,
  };
}
