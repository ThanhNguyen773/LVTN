import mongoose from "mongoose";
import axios from "axios";
import dotenv from "dotenv";
import Product from "../models/product.model.js";

dotenv.config();

console.log("MONGO_URI:", process.env.MONGO_URI); // ✅ Kiểm tra giá trị
async function updateDetectedLabels() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Kết nối MongoDB thành công");

    const products = await Product.find({
      detectedLabel: { $in: [null, ""] },
    });

    console.log(`🛒 Tổng sản phẩm cần gán label: ${products.length}`);

    for (const product of products) {
      try {
        const imageUrl = product.image;

        // Tải ảnh từ URL
        const imageResponse = await axios.get(imageUrl, {
          responseType: "arraybuffer",
        });
        const imageBuffer = imageResponse.data;

        // Gửi ảnh lên Hugging Face để phân loại
        const response = await axios.post(
          "https://api-inference.huggingface.co/models/google/vit-base-patch16-224",
          imageBuffer,
          {
            headers: {
              Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
              "Content-Type": "application/octet-stream",
            },
          }
        );

        const label = response.data?.[0]?.label || "";
        product.detectedLabel = label;
        await product.save();
        console.log(`✅ Gán label '${label}' cho: ${product.name}`);
      } catch (error) {
        console.error(`❌ Lỗi xử lý sản phẩm ${product._id}:`, error.message);
      }
    }

    console.log("🎉 Đã cập nhật xong tất cả sản phẩm!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi kết nối hoặc truy vấn MongoDB:", error.message);
    process.exit(1);
  }
}

updateDetectedLabels();
