require("dotenv").config();
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();

// Instancia o cliente do Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    const result = await model.generateContent(message);

    res.json({
      reply: result.response.text(),
    });
  } catch (error) {
    console.error("Erro na rota /api/chat:", error);
    res.status(500).json({ error: "Erro ao conectar com Gemini" });
  }
});

module.exports = router;
