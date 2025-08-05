import { useState, useCallback, useRef } from "react";
import { Upload } from "lucide-react";
import toast from "react-hot-toast";

const categories = [
  { label: "Home Page", value: "homepage" },
  { label: "New Product", value: "new" },
  { label: "Best Seller Product", value: "best-seller" },
  { label: "Sales", value: "sale" },
];

const BannerForm = ({ onAdd }) => {
  const [newBanner, setNewBanner] = useState({
    image: "",
    link: "",
    category: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const validate = () => {
    const errs = {};
    if (!newBanner.category) errs.category = "Category is required.";
    if (!newBanner.image) errs.image = "Image is required.";
    if (newBanner.link) {
      try {
        new URL(newBanner.link);
      } catch {
        errs.link = "Invalid link format.";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleImageFile = (file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image is too large. Max 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewBanner((prev) => ({ ...prev, image: reader.result }));
      setErrors((e) => ({ ...e, image: undefined }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    handleImageFile(file);
  }, []);

  const handleFileChange = (e) => {
    handleImageFile(e.target.files[0]);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) {
      toast.error("Please fix the form errors.");
      return;
    }

    try {
      setSubmitting(true);
      await onAdd(newBanner);
      setNewBanner({ image: "", link: "", category: "" });
      setErrors({});
      toast.success("Banner added successfully!");
    } catch (err) {
      toast.error("An error occurred while adding banner.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full"
      noValidate
    >
      {/* Left: inputs */}
      <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category */}
        <div className="flex flex-col">
          <label
            className="mb-1 text-sm font-medium text-gray-200"
            htmlFor="banner-category"
          >
            Category <span className="text-red-400">*</span>
          </label>
          <select
            id="banner-category"
            value={newBanner.category}
            onChange={(e) =>
              setNewBanner((prev) => ({ ...prev, category: e.target.value }))
            }
            className="px-4 py-2 rounded-md bg-gray-700 text-white w-full"
            aria-invalid={!!errors.category}
            aria-describedby={errors.category ? "error-category" : undefined}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <div
              id="error-category"
              className="text-red-400 text-xs mt-1"
              role="alert"
            >
              {errors.category}
            </div>
          )}
        </div>

        {/* Link */}
        <div className="flex flex-col">
          <label
            className="mb-1 text-sm font-medium text-gray-200"
            htmlFor="banner-link"
          >
            Destination Link
          </label>
          <input
            id="banner-link"
            type="text"
            placeholder="https://example.com"
            className="px-4 py-2 rounded-md bg-gray-700 text-white w-full"
            value={newBanner.link}
            onChange={(e) =>
              setNewBanner((prev) => ({ ...prev, link: e.target.value }))
            }
            aria-invalid={!!errors.link}
            aria-describedby={errors.link ? "error-link" : undefined}
          />
          {errors.link && (
            <div
              id="error-link"
              className="text-red-400 text-xs mt-1"
              role="alert"
            >
              {errors.link}
            </div>
          )}
        </div>

        {/* Image upload */}
        <div className="md:col-span-2 flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-200">
            Banner Image <span className="text-red-400">*</span>
          </label>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="relative flex flex-col items-center justify-center px-4 py-8 rounded-md bg-gray-800 text-white cursor-pointer w-full border-2 border-dashed border-gray-600 hover:border-gray-500 transition"
            aria-label="Upload banner image"
          >
            <Upload className="w-6 h-6 mb-2" />
            <div className="text-sm font-medium">
              Drag & drop or click to upload
            </div>
            <div className="mt-1 text-xs">Max 2MB. JPG/PNG/WebP.</div>

            {/* Hidden input covers entire area to allow click anywhere for file picker */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
              aria-label="Choose banner image"
            />

            {/* Optional explicit button to avoid confusion */}
            {/* <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white text-sm"
            >
              Select Image
            </button> */}
          </div>
          {errors.image && (
            <div className="text-red-400 text-xs mt-1" role="alert">
              {errors.image}
            </div>
          )}
        </div>
      </div>

      {/* Right: preview & submit */}
      <div className="flex flex-col gap-4">
        {/* Preview box */}
        <div className="flex-1 flex flex-col bg-gray-800 rounded-md p-4">
          <div className="text-sm font-medium text-gray-200 mb-2">Preview</div>
          <div className="flex-1 flex items-center justify-center border border-gray-700 rounded-md overflow-hidden bg-black">
            {newBanner.image ? (
              <img
                src={newBanner.image}
                alt="preview"
                className="max-h-48 object-contain"
              />
            ) : (
              <div className="text-gray-500 text-xs">No image selected</div>
            )}
          </div>
          <div className="mt-3 text-xs text-gray-300 space-y-1">
            <div>
              <span className="font-medium">Category:</span>{" "}
              {newBanner.category || (
                <span className="text-gray-500">Not selected</span>
              )}
            </div>
            {newBanner.link && (
              <div>
                <span className="font-medium">Link:</span> {newBanner.link}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            className={`w-full flex justify-center items-center gap-2 px-6 py-3 text-white rounded-md font-semibold transition ${
              submitting
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            disabled={submitting}
          >
            {submitting ? "Adding..." : "Add Banner"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default BannerForm;
