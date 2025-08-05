import { useEffect, useState, useRef } from "react";
import { Trash2, Eye, EyeOff } from "lucide-react";
import { useBannerStore } from "../stores/useBannerStore";
import toast from "react-hot-toast";
import BannerForm from "./BannerForm";
import { motion } from "framer-motion";

const categories = [
  { label: "All", value: "all" },
  { label: "Home Page", value: "homepage" },
  { label: "New Product", value: "new" },
  { label: "Best Seller Product", value: "best-seller" },
  { label: "Sales", value: "sale" },
];

const sortOptions = [
  { label: "Newest", value: "createdAt_desc" },
  { label: "Oldest", value: "createdAt_asc" },
  { label: "Active First", value: "isActive_desc" },
  { label: "Inactive First", value: "isActive_asc" },
];

const SOFT_DELETE_DELAY = 7000;

const BannerList = () => {
  const {
    banners,
    fetchBanners,
    addBanner,
    deleteBanner,
    toggleActive,
    undoDelete,
  } = useBannerStore();
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortKey, setSortKey] = useState("createdAt_desc");

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Toast inner component with its own ticking progress
  const SoftDeleteToast = ({ banner, undo, onExpire }) => {
    const startRef = useRef(Date.now());
    const [progress, setProgress] = useState(0); // 0..1

    useEffect(() => {
      let rafId;

      const tick = () => {
        const elapsed = Date.now() - startRef.current;
        const p = Math.min(elapsed / SOFT_DELETE_DELAY, 1);
        setProgress(p);
        if (p < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          if (onExpire) onExpire();
        }
      };

      rafId = requestAnimationFrame(tick);
      return () => {
        if (rafId) cancelAnimationFrame(rafId);
      };
    }, [onExpire]);

    const secondsLeft = Math.ceil((1 - progress) * (SOFT_DELETE_DELAY / 1000));

    return (
      <div className="w-80 flex flex-col space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-semibold text-white">
              Banner temporarily deleted
            </div>
            <div className="text-xs text-gray-300 mt-1">
              Category:{" "}
              <span className="font-medium text-white">{banner.category}</span>
            </div>
          </div>
          <div>
            <button
              onClick={undo}
              className="text-xs font-medium underline text-blue-300 hover:text-blue-200 focus:outline-none"
              aria-label="Undo delete"
            >
              Undo
            </button>
          </div>
        </div>
        <div className="relative h-1 bg-gray-700 rounded overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-400"
            style={{
              width: `${Math.round(progress * 100)}%`, // đầy dần
              transition: "width 0.1s linear",
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400">
          <div>Will be purged soon</div>
          <div>{secondsLeft}s left</div>
        </div>
      </div>
    );
  };

  const handleDelete = (banner) => {
    deleteBanner(banner._id);

    const toastId = toast.custom(
      (t) => {
        return (
          <div
            className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-md"
            role="alert"
            aria-live="polite"
          >
            <SoftDeleteToast
              banner={banner}
              undo={() => {
                undoDelete(banner._id, banner);
                toast.dismiss(toastId);
                toast.success("Banner deletion undone!");
              }}
              onExpire={() => {
                // nothing special needed; real deletion already happened on backend
              }}
            />
          </div>
        );
      },
      {
        duration: SOFT_DELETE_DELAY,
        position: "bottom-right",
      }
    );
  };

  const applyFilterSort = () => {
    let list =
      filterCategory === "all"
        ? [...banners]
        : banners.filter((b) => b.category === filterCategory);

    switch (sortKey) {
      case "createdAt_desc":
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "createdAt_asc":
        list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "isActive_desc":
        list.sort((a, b) =>
          b.isActive === a.isActive ? 0 : b.isActive ? 1 : -1
        );
        break;
      case "isActive_asc":
        list.sort((a, b) =>
          a.isActive === b.isActive ? 0 : a.isActive ? 1 : -1
        );
        break;
      default:
        break;
    }

    return list;
  };

  const filteredBanners = applyFilterSort();

  return (
    <motion.div
      className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-8 max-w-7xl mx-auto mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header + Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-white mr-4">
            Banner Management
          </h2>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <label className="text-white whitespace-nowrap">Filter:</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-gray-800 text-white px-3 py-2 rounded-md min-w-[140px]"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-white whitespace-nowrap">Sort:</label>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
                className="bg-gray-800 text-white px-3 py-2 rounded-md min-w-[140px]"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Banner creation form */}
      <div className="bg-gray-800 rounded-lg p-5">
        <BannerForm onAdd={addBanner} />
      </div>

      {/* Banner list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBanners.map((banner) => (
          <div
            key={banner._id}
            className={`relative border border-gray-700 rounded-lg overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900 flex flex-col transition-shadow ${
              !banner.isActive ? "group" : ""
            }`}
          >
            <div className="relative">
              <img
                src={banner.image}
                alt={banner.alt || "banner"}
                className="w-full h-36 object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-2 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleActive(banner._id);
                  }}
                  className={`p-1 rounded-full bg-black/50 ${
                    banner.isActive
                      ? "text-green-400 hover:text-green-300"
                      : "text-yellow-400 hover:text-yellow-300"
                  }`}
                  title={banner.isActive ? "Hide" : "Show"}
                  aria-label={banner.isActive ? "Hide banner" : "Show banner"}
                >
                  {banner.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(banner);
                  }}
                  className="p-1 rounded-full bg-black/50 text-red-400 hover:text-red-300"
                  aria-label="Delete banner"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-between p-3">
              <div className="text-gray-300 text-sm mb-2 break-all">
                <div>
                  <span className="font-medium">Category:</span>{" "}
                  {banner.category}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div
                  className={`text-xs px-2 py-1 rounded ${
                    banner.isActive ? "bg-green-600" : "bg-yellow-600"
                  } text-white`}
                >
                  {banner.isActive ? "Showing" : "Hidden"}
                </div>
                <div className="text-[10px] text-gray-400">
                  {banner.createdAt
                    ? new Date(banner.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : ""}
                </div>
              </div>
            </div>

            {!banner.isActive && (
              <div className="pointer-events-none absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-yellow-400 transition" />
            )}
          </div>
        ))}

        {filteredBanners.length === 0 && (
          <div className="col-span-full text-center text-gray-400 py-12">
            No matching banners.
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BannerList;
