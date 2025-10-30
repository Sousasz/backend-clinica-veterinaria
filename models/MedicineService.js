const Medicine = require('./Medicine');

class MedicineService {
  static async createMedicine(medicineData) {
    try {
      const newMedicine = new Medicine(medicineData);
      await newMedicine.save();
      return { success: true, message: 'Medicamento adicionado com sucesso', medicine: newMedicine, status: 201 };
    } catch (error) {
      console.error('Erro no MedicineService.createMedicine:', error);
      if (error.code === 11000) { // Duplicate key error
        return { success: false, message: 'Medicamento com este nome já existe.', status: 409 };
      }
      if (error.name === 'ValidationError') {
        const validationErrors = {};
        Object.keys(error.errors).forEach(key => {
          validationErrors[key] = error.errors[key].message;
        });
        return { success: false, errors: validationErrors, status: 400 };
      }
      return { success: false, message: 'Erro interno do servidor ao adicionar medicamento', status: 500 };
    }
  }

  static async getMedicines() {
    try {
      return await Medicine.find();
    } catch (error) {
      console.error('Erro no MedicineService.getMedicines:', error);
      throw error;
    }
  }

  static async updateMedicine(id, updateData) {
    try {
      const updatedMedicine = await Medicine.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
      if (!updatedMedicine) {
        return { success: false, message: 'Medicamento não encontrado', status: 404 };
      }
      return { success: true, message: 'Medicamento atualizado com sucesso', medicine: updatedMedicine, status: 200 };
    } catch (error) {
      console.error('Erro no MedicineService.updateMedicine:', error);
      if (error.code === 11000) {
        return { success: false, message: 'Medicamento com este nome já existe.', status: 409 };
      }
      if (error.name === 'ValidationError') {
        const validationErrors = {};
        Object.keys(error.errors).forEach(key => {
          validationErrors[key] = error.errors[key].message;
        });
        return { success: false, errors: validationErrors, status: 400 };
      }
      return { success: false, message: 'Erro interno do servidor ao atualizar medicamento', status: 500 };
    }
  }

  static async deleteMedicine(id) {
    try {
      const deletedMedicine = await Medicine.findByIdAndDelete(id);
      if (!deletedMedicine) {
        return { success: false, message: 'Medicamento não encontrado', status: 404 };
      }
      return { success: true, message: 'Medicamento excluído com sucesso', status: 200 };
    } catch (error) {
      console.error('Erro no MedicineService.deleteMedicine:', error);
      return { success: false, message: 'Erro interno do servidor ao excluir medicamento', status: 500 };
    }
  }
}

module.exports = MedicineService;
