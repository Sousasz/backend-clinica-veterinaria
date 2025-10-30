const Appointment = require('./Appointment');

class AppointmentService {
  static async createAppointment(appointmentData) {
    try {
      const newAppointment = new Appointment(appointmentData);
      await newAppointment.save();
      return { success: true, message: 'Agendamento criado com sucesso', appointment: newAppointment, status: 201 };
    } catch (error) {
      console.error('Erro no AppointmentService.createAppointment:', error);
      if (error.name === 'ValidationError') {
        const validationErrors = {};
        Object.keys(error.errors).forEach(key => {
          validationErrors[key] = error.errors[key].message;
        });
        return { success: false, errors: validationErrors, status: 400 };
      }
      return { success: false, message: 'Erro interno do servidor ao criar agendamento', status: 500 };
    }
  }

  static async getAppointmentsByClient(clientId) {
    try {
      return await Appointment.find({ client: clientId }).populate('pet', 'name species');
    } catch (error) {
      console.error('Erro no AppointmentService.getAppointmentsByClient:', error);
      throw error;
    }
  }

  static async getAllAppointments() {
    try {
      return await Appointment.find().populate('client', 'username addressStreet addressNumber addressNeighborhood').populate('pet', 'name species');
    } catch (error) {
      console.error('Erro no AppointmentService.getAllAppointments:', error);
      throw error;
    }
  }

  // Adicione métodos para atualizar e deletar agendamentos se necessário
}

module.exports = AppointmentService;
