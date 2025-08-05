import mongoose from "mongoose";
const policySchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ["shipping", "return", "warranty","info", "contact", "social", "other"], default: "other" },
  content: { type: String, required: false },
}, { timestamps: true });
export default mongoose.model("Policy", policySchema);