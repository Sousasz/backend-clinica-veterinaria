const express = require('express');
const router = express.Router();
const puter = require('puter'); // mudar aqui

router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Mensagem é obrigatória.' });

  try {
    const response = await puter({
      messages: [
        {
          role: 'system',
          content: `
            Você é um veterinário especializado em home care. 
            Sempre forneça respostas amigáveis e incentive a consulta com a Doutora Joyce.
            Responda sintomas comuns como vômitos, diarréia, febre, coceira, apatia, falta de apetite, pintas na pele.
          `
        },
        { role: 'user', content: message }
      ],
      defaultReply: "Não conheço o caso específico, mas a melhor forma de cuidar do seu pet é agendar uma consulta com a Doutora Joyce em home care."
    });

    res.json({ reply: response.message || response.choices?.[0]?.message?.content || "Ocorreu um erro na resposta" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao processar a solicitação.' });
  }
});

module.exports = router;
