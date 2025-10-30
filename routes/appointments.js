const express = require('express');
const { createAppointment, getClientAppointments, getAllAppointments } = require('../controllers/appointmentController');
const router = express.Router();

router.post('/', createAppointment);
router.get('/client', getClientAppointments); // Agendamentos do cliente logado
router.get('/all', getAllAppointments); // Todos os agendamentos (para admin)

module.exports = router;

