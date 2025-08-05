import express from "express";
import { detectIntent } from "../utils/dialogflow.util.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { message } = req.body;

  if (!message) return res.status(400).json({ error: "Missing message" });

  try {
    const response = await detectIntent(message);
    res.json(response);
  } catch (error) {
    console.error("Dialogflow Error:", error);
    res.status(500).json({ error: "Failed to get response from Dialogflow" });
  }
});

export default router;
