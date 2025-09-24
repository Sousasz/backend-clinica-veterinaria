// FileName: MultipleFiles/authController.js
const UserService = require('../models/UserService'); // Caminho corrigido para o UserService
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { username, password, documentId, dateOfBirth, phone, cep, addressNumber, addressComplement, addressStreet, addressNeighborhood } = req.body;

    // Delega a criação do usuário ao UserService
    const result = await UserService.createUser({
      username,
      password,
      documentId,
      dateOfBirth,
      phone,
      cep,
      addressNumber,
      addressComplement,
      addressStreet,
      addressNeighborhood
    });

    if (!result.success) {
      return res.status(result.status || 400).json({ message: result.message || 'Erro ao registrar usuário', errors: result.errors });
    }

    res.status(result.status).json({ message: result.message, user: result.user });

  } catch (error) {
    console.error('Erro no authController.register:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao registrar usuário' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Delega a validação de credenciais ao UserService
    const result = await UserService.validateCredentials(username, password);

    if (!result.isValid) {
      return res.status(result.status || 401).json({ message: result.message });
    }

    const user = result.user;
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });

  } catch (error) {
    console.error('Erro no authController.login:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao fazer login' });
  }
};
