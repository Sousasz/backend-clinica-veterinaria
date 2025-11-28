const Pet = require('../models/pet');

class PetService {
  static async createPet(petData) {
    try {
      const pet = new Pet(petData);
      await pet.save();
      return { success: true, status: 201, message: 'Pet cadastrado com sucesso!', pet };
    } catch (error) {
      console.error('Erro ao criar pet:', error);
      if (error.name === 'ValidationError') {
        return { success: false, status: 400, message: 'Dados inválidos.', errors: error.errors };
      }
      return { success: false, status: 500, message: 'Erro interno ao salvar pet.' };
    }
  }

  static async getPetsByOwner(ownerId) {
    try {
      const pets = await Pet.find({ owner: ownerId }).populate('owner', 'name email'); // Popula dados do owner se necessário
      return pets;
    } catch (error) {
      console.error('Erro ao buscar pets:', error);
      throw new Error('Erro interno ao buscar pets.');
    }
  }
}

module.exports = PetService;
