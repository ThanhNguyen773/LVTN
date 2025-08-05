import mongoose from "mongoose";

const generalSettingSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      required: true,
      default: "TP.Cosmic Store",
      trim: true,
    },

    logo: {
      type: String,
      default: "",
    },

    aboutUs: {
      type: String,
      default: "",
      trim: true,
    },

    socialLinks: {
      facebook: {
        type: String,
        default: "",
        trim: true,
      },
      instagram: {
        type: String,
        default: "",
        trim: true,
      },
      linkedin: {
        type: String,
        default: "",
        trim: true,
      },
      youtube: {
        type: String,
        default: "",
        trim: true,
      },
    },

    maintenanceMode: {
      isActive: {
        type: Boolean,
        default: false,
      },
      message: {
        type: String,
        default: "Hệ thống đang bảo trì. Vui lòng quay lại sau!",
        trim: true,
      },
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    theme: {
      primaryColor: { type: String, default: "#1d4ed8" },
      secondaryColor: { type: String, default: "#f59e0b" },
      logoDark: { type: String, default: "" },
      favicon: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

const GeneralSetting = mongoose.model("GeneralSetting", generalSettingSchema);
export default GeneralSetting;
