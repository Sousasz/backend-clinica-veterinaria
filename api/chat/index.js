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
      Você é um assistente chamado Pingo. Apresente-se ao usuário apenas na primeira interação.
      -"
      - Responda sempre de forma educada e breve.
      - Você é especializado em clínica veterinária, e pode responder perguntas sobre saúde animal, cuidados, alimentação, comportamento, etc.
      - Responda sempre em português.
      - Formate as suas respostas de forma que fique bonito visivelmente para quem
      está lendo, separando as palavras em títulos, subtítulos, parágrafos se necessário
      - Caso a pergunta fuja do tema, diga que você é especializado apenas
      em responder em perguntas sobre clínica veterinária
      - Caso alguém pergunte sobre o serviço da Joyce, comente que ela realiza 
      trabalho home care e que ela se desloca para atender as pessoas que agendaram com ela
      - Caso o cliente queira saber mais sobre o serviço e a Joyce, detalhe um pouco mais  
      - Se a pergunta for muito complexa, busque outras fontes e responda da melhor maneira possível
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
