// FileName: MultipleFiles/PetService.js
const Pet = require('./pet');

class PetService {
  static async createPet(petData) {
    try {
      const newPet = new Pet(petData);
      await newPet.save();
      return { success: true, message: 'Pet cadastrado com sucesso', pet: newPet, status: 201 };
    } catch (error) {
      console.error('Erro no PetService.createPet:', error);
      if (error.name === 'ValidationError') {
        const validationErrors = {};
        Object.keys(error.errors).forEach(key => {
          validationErrors[key] = error.errors[key].message;
        });
        return { success: false, errors: validationErrors, status: 400 };
      }
      return { success: false, message: 'Erro interno do servidor ao cadastrar pet', status: 500 };
    }
  }

  static async getPetsByOwner(ownerId) {
    try {
      return await Pet.find({ owner: ownerId });
    } catch (error) {
      console.error('Erro no PetService.getPetsByOwner:', error);
      throw error;
    }
  }

  // Adicione métodos para atualizar e deletar pets se necessário
}

module.exports = PetService;
