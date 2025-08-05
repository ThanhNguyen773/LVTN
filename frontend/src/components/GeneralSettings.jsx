// GeneralSettings.jsx
import { useEffect, useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  Save,
  ArrowLeft,
  CheckCircle,
  XCircle,
  UploadCloud,
} from "lucide-react";
import clsx from "clsx";
import { useSettingStore } from "../stores/useSettingStore";
import { useNavigate } from "react-router-dom";

const DEBOUNCE_MS = 500;

export default function GeneralSettings() {
  const navigate = useNavigate();
  const { setting, fetchSetting, updateSetting, loading, error, clearError } =
    useSettingStore();

  const [local, setLocal] = useState({
    storeName: "",
    aboutUs: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    youtube: "",
    isActive: false,
    message: "",
    logoFile: null,
  });

  const [previewLogo, setPreviewLogo] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const maintenanceTimer = useRef(null);
  const isFirstMaintenanceLoad = useRef(true);

  useEffect(() => {
    fetchSetting();
  }, []);

  useEffect(() => {
    if (setting) {
      setLocal({
        storeName: setting.storeName || "",
        aboutUs: setting.aboutUs || "",
        facebook: setting.socialLinks?.facebook || "",
        instagram: setting.socialLinks?.instagram || "",
        linkedin: setting.socialLinks?.linkedin || "",
        youtube: setting.socialLinks?.youtube || "",
        isActive: setting.maintenanceMode?.isActive || false,
        message: setting.maintenanceMode?.message || "",
        logoFile: null,
      });
      setPreviewLogo(setting.logo || "");
    }
  }, [setting]);

  // Validation
  const validationErrors = useMemo(() => {
    const errs = {};
    if (!local.storeName.trim()) errs.storeName = "Store name is required.";
    return errs;
  }, [local.storeName]);

  // Handle logo drag/drop
  const fileInputRef = useRef(null);
  const handleFilePicked = (file) => {
    if (!file) return;
    setLocal((s) => ({ ...s, logoFile: file }));
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewLogo(ev.target.result);
    reader.readAsDataURL(file);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleFilePicked(file);
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleFilePicked(file);
    }
  };

  // Auto-save maintenance mode & message when changed
  // useEffect(() => {
  //   // Skip initial load to avoid double saving
  //   if (isFirstMaintenanceLoad.current) {
  //     isFirstMaintenanceLoad.current = false;
  //     return;
  //   }
  //   // debounce to avoid too many requests when typing message
  //   if (maintenanceTimer.current) clearTimeout(maintenanceTimer.current);
  //   maintenanceTimer.current = setTimeout(async () => {
  //     try {
  //       await updateSetting({
  //         storeName: local.storeName,
  //         aboutUs: local.aboutUs,
  //         facebook: local.facebook,
  //         instagram: local.instagram,
  //         linkedin: local.linkedin,
  //         youtube: local.youtube,
  //         isActive: local.isActive,
  //         message: local.message,
  //         logoFile: null, // don't reupload logo here
  //       });
  //       setSuccessMsg("Saved.");
  //       // clear after short time
  //       setTimeout(() => setSuccessMsg(""), 1500);
  //     } catch (e) {
  //       // error in store
  //     }
  //   }, DEBOUNCE_MS);
  //   return () => {
  //     if (maintenanceTimer.current) clearTimeout(maintenanceTimer.current);
  //   };
  //   // Only watch isActive and message
  // }, [local.isActive, local.message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setSuccessMsg("");
    if (Object.keys(validationErrors).length) return;

    try {
      await updateSetting({
        storeName: local.storeName,
        aboutUs: local.aboutUs,
        facebook: local.facebook,
        instagram: local.instagram,
        linkedin: local.linkedin,
        youtube: local.youtube,
        isActive: local.isActive,
        message: local.message,
        logoFile: local.logoFile,
      });
      setSuccessMsg("Settings updated successfully.");
    } catch (err) {
      // handled in store
    }
  };

  return (
    <motion.div
      className="bg-gray-800 border border-gray-700 shadow-lg rounded-lg overflow-hidden max-w-6xl mx-auto mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gray-900">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-md shadow transition"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
          <h2 className="text-2xl font-bold text-white">General Settings</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-300">
            Last updated:{" "}
            {setting?.updatedAt
              ? new Date(setting.updatedAt).toLocaleString("en-US")
              : "-"}
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading || Object.keys(validationErrors).length > 0}
            className={clsx(
              "flex items-center gap-2 px-5 py-2 rounded shadow font-medium transition",
              loading
                ? "bg-gray-500 cursor-not-allowed text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            )}
          >
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Alerts */}
        {error && (
          <div className="flex items-start gap-3 bg-red-700/20 border border-red-600 text-red-100 p-3 rounded">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 flex justify-between">
              <div>{error}</div>
              <button
                onClick={() => clearError()}
                className="text-sm underline"
              >
                Close
              </button>
            </div>
          </div>
        )}
        {successMsg && (
          <div className="flex items-center gap-2 bg-green-700/20 border border-green-600 text-green-100 p-3 rounded">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <div>{successMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Store Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">
                Store Name *
              </label>
              <input
                type="text"
                value={local.storeName}
                onChange={(e) =>
                  setLocal((s) => ({ ...s, storeName: e.target.value }))
                }
                className={clsx(
                  "w-full bg-gray-900 text-white border rounded px-3 py-2 focus:outline-none",
                  validationErrors.storeName
                    ? "border-red-500"
                    : "border-gray-600"
                )}
                placeholder="e.g. TP.Cosmic Store"
              />
              {validationErrors.storeName && (
                <p className="text-xs text-red-400">
                  {validationErrors.storeName}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">
                About Us
              </label>
              <textarea
                value={local.aboutUs}
                onChange={(e) =>
                  setLocal((s) => ({ ...s, aboutUs: e.target.value }))
                }
                rows={4}
                className="w-full bg-gray-900 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none"
                placeholder="Short description about the store"
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Social Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "facebook", label: "Facebook" },
                { name: "instagram", label: "Instagram" },
                { name: "linkedin", label: "LinkedIn" },
                { name: "youtube", label: "YouTube" },
              ].map((item) => (
                <div key={item.name} className="space-y-1">
                  <label className="block text-sm font-medium text-gray-200">
                    {item.label}
                  </label>
                  <input
                    type="url"
                    value={local[item.name]}
                    onChange={(e) =>
                      setLocal((s) => ({ ...s, [item.name]: e.target.value }))
                    }
                    className="w-full bg-gray-900 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none"
                    placeholder={`https://...`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Maintenance Mode</h3>
            <div className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-lg px-4 py-3">
              <div>
                <p className="text-white font-semibold">
                  Enable Maintenance Mode
                </p>
                <p className="text-sm text-gray-400">
                  Temporarily disables site for regular users. Only admins can
                  access.
                </p>
              </div>

              {/* Custom Toggle Switch */}
              <button
                type="button"
                onClick={() =>
                  setLocal((s) => ({ ...s, isActive: !s.isActive }))
                }
                className={clsx(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300",
                  local.isActive ? "bg-green-500" : "bg-gray-600"
                )}
              >
                <span
                  className={clsx(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300",
                    local.isActive ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>

            <div className="mt-2 space-y-2">
              <label className="block text-sm font-medium text-gray-200">
                Maintenance Message
              </label>
              <input
                type="text"
                value={local.message}
                onChange={(e) =>
                  setLocal((s) => ({ ...s, message: e.target.value }))
                }
                className="w-full bg-gray-900 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none"
                placeholder="We are performing maintenance..."
              />
              <p className="text-xs text-gray-400">
                Changes to maintenance mode are saved automatically.
              </p>
            </div>
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-white">Store Logo</h3>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-600 rounded-lg p-5 flex flex-col md:flex-row gap-6 bg-gray-900"
            >
              <div className="flex-shrink-0">
                <div className="w-32 h-32 border rounded flex items-center justify-center overflow-hidden bg-gray-800">
                  {previewLogo ? (
                    <img
                      src={previewLogo}
                      alt="Logo preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-gray-400 text-sm">No logo</div>
                  )}
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-gray-300" />
                    <div className="text-gray-200">
                      Drag & drop an image here, or{" "}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="underline"
                      >
                        Click here to upload
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  Max size ~2MB. Only images are allowed.
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Hidden submit for accessibility */}
          <div className="hidden">
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
