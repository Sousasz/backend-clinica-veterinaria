// routes/auth.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Certifique-se que o caminho está correto
const onSubmit = async (e) => {
  e.preventDefault();
  // O 'formData' aqui é o objeto do estado com todos os campos preenchidos
  const body = JSON.stringify(formData);

  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    const data = await res.json();
    // ... Lógica de sucesso (salvar token, redirecionar) ou erro
  } catch (err) {
    // ... Tratar erro de conexão
  }
};

// ROTA DE CADASTRO (REGISTER)
router.post('/register', async (req, res) => {
  // 1. Recebe todos os dados do corpo da requisição, conforme o seu Schema
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
    // 2. Verifica se o username ou o documentId já existem para evitar duplicados
    let user = await User.findOne({ $or: [{ username }, { documentId }] });
    if (user) {
      return res.status(400).json({ msg: 'Usuário ou Documento já cadastrado.' });
    }

    // 3. Cria uma nova instância do usuário com todos os dados
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
      // O campo 'role' usará o valor padrão 'user' definido no Schema
    });

    // Criptografa a senha antes de salvar
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Gera o token JWT para o usuário recém-criado
    const payload = {
      user: {
        id: user.id,
        role: user.role, // Opcional: incluir a role no token
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
    res.status(500).send('Erro no servidor');
  }
});

// ROTA DE LOGIN
router.post('/login', async (req, res) => {
  // 4. Login agora usa 'username' e 'password'
  const { username, password } = req.body;

  try {
    // 5. Busca o usuário pelo 'username'
    let user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: 'Credenciais inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciais inválidas' });
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
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

module.exports = router;