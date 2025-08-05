import { useState, useRef, useCallback } from "react";
import { X, Upload, Link, Image as ImageIcon, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const ImageSearchModal = ({ open, onClose, onSearch, isUploading }) => {
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [previewSrc, setPreviewSrc] = useState(null);
  const [loadingUrl, setLoadingUrl] = useState(false);
  const dropRef = useRef(null);

  const reset = () => {
    setImageFile(null);
    setPreviewSrc(null);
    setImageUrl("");
    setLoadingUrl(false);
  };

  const handleFile = (file) => {
    setImageFile(file);
    setPreviewSrc(URL.createObjectURL(file));
  };

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    []
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const loadImageFromUrl = async () => {
    if (!imageUrl.trim()) return;
    try {
      setLoadingUrl(true);
      const res = await fetch(imageUrl.trim(), { mode: "cors" });
      if (!res.ok) throw new Error("Failed to fetch image");
      const blob = await res.blob();
      const ext = blob.type.split("/")[1] || "jpg";
      const filename = `from-url.${ext}`;
      const file = new File([blob], filename, { type: blob.type });
      handleFile(file);
    } catch (err) {
      console.error("Load image from URL failed:", err);
      toast.error("Failed to load image from URL. Check the link or CORS policy.");
    } finally {
      setLoadingUrl(false);
    }
  };

  const handleSubmit = async () => {
    if (!imageFile) {
      toast.error("Please select an image or load one from URL.");
      return;
    }
    try {
      await onSearch(imageFile);
      onClose();
      reset();
    } catch (err) {
      // error handling is expected in caller
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4"
      aria-modal="true"
      role="dialog"
      aria-label="Image search modal"
    >
      <div className="bg-gray-900 rounded-2xl shadow-xl max-w-lg w-full p-6 relative">
        <button
          aria-label="Close modal"
          onClick={() => {
            onClose();
            reset();
          }}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-semibold text-white mb-4">
          Search by Image
        </h2>

        <div
          ref={(el) => {
            dropRef.current = el;
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center gap-3 mb-4 cursor-pointer text-center"
          onClick={() => {
            const input = document.getElementById("image-search-file-input");
            input?.click();
          }}
        >
          {!previewSrc ? (
            <>
              <Upload size={40} className="text-gray-400" />
              <p className="text-gray-300">
                Drag & drop an image here or <span className="font-semibold">click</span> to select a file
              </p>
              <p className="text-sm text-gray-500">Or paste an image URL below</p>
              <input
                type="file"
                accept="image/*"
                id="image-search-file-input"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </>
          ) : (
            <div className="relative w-full">
              <img
                src={previewSrc}
                alt="Selected preview"
                className="max-h-48 object-contain mx-auto rounded"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  reset();
                }}
                className="absolute top-1 right-1 bg-gray-800 p-1 rounded-full hover:bg-gray-700"
                aria-label="Remove selected image"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Paste image URL..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded shadow pr-28"
              aria-label="Image URL input"
            />
            <button
              onClick={loadImageFromUrl}
              disabled={loadingUrl}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-blue-500 px-3 py-1 rounded text-white flex items-center gap-1 text-sm"
            >
              {loadingUrl ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Loading</span>
                </>
              ) : (
                <>
                  <Link size={14} />
                  <span>Load</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              onClose();
              reset();
            }}
            className="px-4 py-2 bg-gray-700 rounded-md text-sm text-white hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!imageFile || isUploading}
            className="px-5 py-2 bg-blue-500 rounded-md text-sm font-medium text-white flex items-center gap-2 hover:bg-blue-600 disabled:opacity-60"
          >
            {isUploading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <ImageIcon size={16} />
                <span>Search</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageSearchModal;
