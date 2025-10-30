const PetService = require('../models/PetService');
const jwt = require('jsonwebtoken'); // Para obter o ID do usuário do token

exports.createPet = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const ownerId = decoded.id; // Assumindo que o ID do usuário está no token

    const { name, species, breed, age, neutered, sex, weight, temperament } = req.body;

    const result = await PetService.createPet({
      owner: ownerId,
      name,
      species,
      breed,
      age,
      neutered,
      sex,
      weight,
      temperament,
    });

    if (!result.success) {
      return res.status(result.status || 400).json({ message: result.message || 'Erro ao cadastrar pet', errors: result.errors });
    }

    res.status(result.status).json({ message: result.message, pet: result.pet });

  } catch (error) {
    console.error('Erro no petController.createPet:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido.' });
    }
    res.status(500).json({ message: 'Erro interno do servidor ao cadastrar pet' });
  }
};

exports.getPets = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const ownerId = decoded.id;

    const pets = await PetService.getPetsByOwner(ownerId);
    res.status(200).json(pets);
  } catch (error) {
    console.error('Erro no petController.getPets:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido.' });
    }
    res.status(500).json({ message: 'Erro interno do servidor ao buscar pets' });
  }
};
