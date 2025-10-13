// routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth"); // Importe o middleware

// Função auxiliar para gerar OTP de 6 dígitos
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ROTA DE CADASTRO (REGISTER) - Mantenha como está
router.post("/register", async (req, res) => {
  const {
    username,
    password,
    documentId,
    dateOfBirth,
    phone,
    cep,
    addressNumber,
    addressComplement,
    addressStreet,
    addressNeighborhood,
  } = req.body;

  try {
    let user = await User.findOne({ $or: [{ username }, { documentId }] });
    if (user) {
      return res
        .status(400)
        .json({ msg: "Usuário ou Documento já cadastrado." });
    }

    user = new User({
      username,
      password,
      documentId,
      dateOfBirth,
      phone,
      cep,
      addressNumber,
      addressComplement,
      addressStreet,
      addressNeighborhood,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
});


router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    let user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: "Credenciais inválidas" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Credenciais inválidas" });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
});

router.post("/verify-phone", auth, async (req, res) => {
  try {
    const { phone } = req.body;
    const user = await User.findById(req.user.id);

    if (!user || user.phone !== phone) {
      return res.status(400).json({ msg: "Telefone não encontrado na sua conta." });
    }

    res.json({ msg: "Telefone verificado com sucesso." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
});

// 2. Enviar OTP (gera e salva no user, expira em 10 min)
router.post("/send-otp", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "Usuário não encontrado." });
    }

    // Gera OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    // Salva no user
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // SIMULAÇÃO DE ENVIO DE SMS (integre Twilio aqui)
    console.log(`OTP gerado para envio via SMS: ${otp} para telefone ${user.phone}`);

    res.json({ msg: "Código OTP enviado para seu telefone." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
});

// 3. Verificar OTP
router.post("/verify-otp", auth, async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user.id);

    if (!user || !user.otp || user.otp !== otp) {
      return res.status(400).json({ msg: "Código OTP inválido." });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ msg: "Código OTP expirado. Solicite um novo." });
    }

    // OTP válido, mas não limpa ainda (limpa no reset)
    res.json({ msg: "Código OTP verificado com sucesso." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
});

// 4. Resetar senha (após OTP válido)
router.post("/reset-password", auth, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "Usuário não encontrado." });
    }

    // Verifica se OTP ainda é válido (opcional, mas reforça segurança)
    if (!user.otp || new Date() > user.otpExpiry) {
      return res.status(400).json({ msg: "Sessão de OTP inválida ou expirada." });
    }

    // Criptografa nova senha
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Limpa OTP
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ msg: "Senha redefinida com sucesso." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
});

module.exports = router;
