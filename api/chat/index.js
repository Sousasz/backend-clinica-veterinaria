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

    const systemPrompt = `
      Você é um assistente chamado Pingo. 
      - Responda sempre em português.
      - Tire dúvidas sobre adversidades que ocorrem com os pets dos clientes
      - Caso a pergunta fuja do tema, diga que você é especializado apenas
      em responder em perguntas sobre clínica veterinária
      - Se não souber a resposta, diga que vai pesquisar e busque outras fontes.
    `;

    const result = await model.generateContent([systemPrompt, message]);

    res.json({
      reply: result.response.text(),
    });
  } catch (error) {
    console.error("Erro na rota /api/chat:", error);
    res.status(500).json({ error: "Erro ao conectar com Gemini" });
  }
});

module.exports = router;
