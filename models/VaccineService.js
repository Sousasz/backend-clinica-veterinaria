const Vaccine = require('./Vaccine');

class VaccineService {
  static async createVaccine(vaccineData) {
    try {
      const newVaccine = new Vaccine(vaccineData);
      await newVaccine.save();
      return { success: true, message: 'Vacina adicionada com sucesso', vaccine: newVaccine, status: 201 };
    } catch (error) {
      console.error('Erro no VaccineService.createVaccine:', error);
      if (error.code === 11000) { // Duplicate key error
        return { success: false, message: 'Vacina com este nome já existe.', status: 409 };
      }
      if (error.name === 'ValidationError') {
        const validationErrors = {};
        Object.keys(error.errors).forEach(key => {
          validationErrors[key] = error.errors[key].message;
        });
        return { success: false, errors: validationErrors, status: 400 };
      }
      return { success: false, message: 'Erro interno do servidor ao adicionar vacina', status: 500 };
    }
  }

  static async getVaccines() {
    try {
      return await Vaccine.find();
    } catch (error) {
      console.error('Erro no VaccineService.getVaccines:', error);
      throw error;
    }
  }

  static async updateVaccine(id, updateData) {
    try {
      const updatedVaccine = await Vaccine.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
      if (!updatedVaccine) {
        return { success: false, message: 'Vacina não encontrada', status: 404 };
      }
      return { success: true, message: 'Vacina atualizada com sucesso', vaccine: updatedVaccine, status: 200 };
    } catch (error) {
      console.error('Erro no VaccineService.updateVaccine:', error);
      if (error.code === 11000) {
        return { success: false, message: 'Vacina com este nome já existe.', status: 409 };
      }
      if (error.name === 'ValidationError') {
        const validationErrors = {};
        Object.keys(error.errors).forEach(key => {
          validationErrors[key] = error.errors[key].message;
        });
        return { success: false, errors: validationErrors, status: 400 };
      }
      return { success: false, message: 'Erro interno do servidor ao atualizar vacina', status: 500 };
    }
  }

  static async deleteVaccine(id) {
    try {
      const deletedVaccine = await Vaccine.findByIdAndDelete(id);
      if (!deletedVaccine) {
        return { success: false, message: 'Vacina não encontrada', status: 404 };
      }
      return { success: true, message: 'Vacina excluída com sucesso', status: 200 };
    } catch (error) {
      console.error('Erro no VaccineService.deleteVaccine:', error);
      return { success: false, message: 'Erro interno do servidor ao excluir vacina', status: 500 };
    }
  }
}

module.exports = VaccineService;
