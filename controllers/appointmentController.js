const AppointmentService = require('../models/AppointmentService');
const PetService = require('../models/PetService'); // Para buscar o pet
const jwt = require('jsonwebtoken');

exports.createAppointment = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const clientId = decoded.id;

    const { petName, consultType, description, date, hour } = req.body;

    // Encontrar o pet pelo nome e ownerId
    const clientPets = await PetService.getPetsByOwner(clientId);
    const pet = clientPets.find(p => p.name.toLowerCase() === petName.toLowerCase());

    if (!pet) {
      return res.status(404).json({ message: 'Pet não encontrado para este usuário.' });
    }

    const result = await AppointmentService.createAppointment({
      client: clientId,
      pet: pet._id,
      consultType,
      description,
      date,
      hour,
    });

    res.status(result.status).json(result);

  } catch (error) {
    console.error('Erro no appointmentController.createAppointment:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido.' });
    }
    res.status(500).json({ message: 'Erro interno do servidor ao criar agendamento' });
  }
};

exports.getClientAppointments = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const clientId = decoded.id;

    const appointments = await AppointmentService.getAppointmentsByClient(clientId);
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Erro no appointmentController.getClientAppointments:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido.' });
    }
    res.status(500).json({ message: 'Erro interno do servidor ao buscar agendamentos do cliente' });
  }
};

exports.getAllAppointments = async (req, res) => {
  try {
    // Pode adicionar verificação de role para admin aqui
    const appointments = await AppointmentService.getAllAppointments();
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Erro no appointmentController.getAllAppointments:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar todos os agendamentos' });
  }
};
