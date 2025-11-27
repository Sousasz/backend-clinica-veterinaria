const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const twilio = require("twilio");
const jwt = require("jsonwebtoken");
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);


function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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
  
    const cleanUsername = username.replace(/\D/g, "");
    const cleanDocumentId = documentId.replace(/\D/g, "");


    let user = await User.findOne({ $or: [{ username: cleanUsername }, { documentId: cleanDocumentId }] });
    if (user) {
      return res.status(400).json({ msg: "Usuário ou Documento já cadastrado." });
    }

  
    let formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.length < 10) {
      return res.status(400).json({ msg: "Telefone inválido. Deve ter pelo menos 10 dígitos." });
    }
    if (!formattedPhone.startsWith("55")) formattedPhone = "55" + formattedPhone;

    
    user = new User({
      username: cleanUsername, 
      password,
      documentId: cleanDocumentId,
      dateOfBirth,
      phone: formattedPhone,
      cep,
      addressNumber,
      addressComplement,
      addressStreet,
      addressNeighborhood,
    });


    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    console.log("Tentando salvar usuário:", { username: cleanUsername, phone: formattedPhone });
    await user.save();
    console.log("Usuário salvo com sucesso."); 

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
        if (err) {
          console.error("Erro ao gerar token JWT:", err.message);
          return res.status(500).json({ msg: "Erro ao gerar token." });
        }
        res.status(201).json({ token });
      }
    );
  } catch (err) {
    console.error("Erro no registro:", err.message);
    res.status(500).json({ msg: "Erro no servidor. Verifique os dados e tente novamente." });
  }
});

router.post("/login", async   (req, res) => {
  const { cpf, password } = req.body;

  try {
    if (!cpf) {
      return res.status(400).json({ msg: "CPF é obrigatório" });
    }

    const cleanCpf = cpf.replace(/\D/g, "");

    const user = await User.findOne({ documentId: cleanCpf });

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
    console.error("Erro no login:", err);
    res.status(500).send("Erro no servidor");
  }
});


router.post("/forgot-password", async (req, res) => {
  const { identifier } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ username: identifier }, { phone: identifier }],
    });
    if (!user) {
      return res.status(404).json({ msg: "Usuário não encontrado." });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    let phoneNumber = user.phone.replace(/\D/g, "");
    if (!phoneNumber.startsWith("55")) {
      phoneNumber = "55" + phoneNumber;
    }
    phoneNumber = "+" + phoneNumber;

    console.log(`Telefone original: ${user.phone}, Formatado: ${phoneNumber}`);

    await client.messages.create({
      body: `Seu código OTP para redefinição de senha é: ${otp}. Expira em 10 minutos.`,
      from: process.env.TWILIO_PHONE,
      to: phoneNumber,
    });

    console.log(`OTP enviado: ${otp} para ${phoneNumber}`);

    res.json({
      msg: "Código OTP enviado para seu telefone. Verifique em alguns instantes.",
    });
  } catch (err) {
    console.error("Erro ao enviar SMS:", err.message);
    res.status(500).send("Erro no servidor");
  }
});

router.post("/verify-otp", async (req, res) => {
  const { identifier, otp } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ username: identifier }, { phone: identifier }],
    });
    if (!user) {
      return res.status(404).json({ msg: "Usuário não encontrado." });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ msg: "Código OTP inválido." });
    }

    if (new Date() > user.otpExpiry) {
      return res
        .status(400)
        .json({ msg: "Código OTP expirado. Solicite um novo." });
    }

    res.json({ msg: "Código OTP verificado com sucesso.", userId: user.id }); // Retorna userId para o próximo passo
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
});

router.post("/reset-password", async (req, res) => {
  const { userId, newPassword } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "Usuário não encontrado." });
    }

    if (!user.otp || new Date() > user.otpExpiry) {
      return res.status(400).json({ msg: "Sessão de OTP inválida ou expirada." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.otp = undefined; // Corrigido: limpar OTP
    user.otpExpiry = undefined;
    await user.save();

    res.json({
      msg: "Senha redefinida com sucesso. Faça login com a nova senha.",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erro no servidor");
  }
});

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "Acesso negado. Token não fornecido." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token inválido." });
  }
};

router.delete("/delete-account", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    await User.findByIdAndDelete(userId);

    res.json({ message: "Conta excluída com sucesso." });
  } catch (err) {
    console.error("Erro ao excluir conta:", err);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

module.exports = router;