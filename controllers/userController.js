// controllers/userController.js
const User = require('../models/User'); // Importa o modelo User

// Função para obter os dados pessoais do usuário
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp -otpExpiry');
    
    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado' });
    }
    
    res.json({
      id: user._id,
      username: user.username,     
      role: user.role,
      documentId: user.documentId, 
      dateOfBirth: user.dateOfBirth,
      phone: user.phone,
      cep: user.cep,
      addressNumber: user.addressNumber,
      addressComplement: user.addressComplement,
      addressStreet: user.addressStreet,
      addressNeighborhood: user.addressNeighborhood,
    });
  } catch (err) {
    console.error('Erro ao buscar dados do usuário:', err.message);
    res.status(500).json({ msg: 'Erro interno do servidor' });
  }
};

module.exports = {
  getUserProfile,
};
