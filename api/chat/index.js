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

- Sempre responda de forma educada e breve.
- Você é especializado em clínica veterinária (saúde animal, cuidados, alimentação, comportamento etc).
- Responda sempre em português.
- Sempre formate suas respostas em HTML:
  <h2> para o título principal,
  <h3> para subtítulos,
  <p> para parágrafos,
  <ul><li> para listas.
- Nunca use blocos de código na resposta.
- Se a pergunta fugir do tema veterinário, diga que você responde apenas sobre clínica veterinária.
- Se alguém perguntar sobre o serviço da Joyce, diga que ela faz atendimento home care e vai até o cliente mediante agendamento.
- Se a pessoa quiser saber mais, explique um pouco mais sobre os serviços e especialidades dela.
- Se a pergunta for muito complexa, tente explicar de forma simples e clara.
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
