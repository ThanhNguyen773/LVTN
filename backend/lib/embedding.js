import axios from "axios";
import dotenv from "dotenv";

// Load biến môi trường từ file .env
dotenv.config();

const HF_TOKEN = process.env.HUGGINGFACE_TOKEN;

export const getImageEmbedding = async (imageBase64) => {
  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32",
      {
        inputs: {
          image: imageBase64, // ảnh dạng base64 hoặc URL
        },
      },
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Lỗi tạo embedding:", error.message);
    return null;
  }
};
