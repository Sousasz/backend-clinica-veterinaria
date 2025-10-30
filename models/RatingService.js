const Rating = require('./Rating');

class RatingService {
  static async createRating(ratingData) {
    try {
      const newRating = new Rating(ratingData);
      await newRating.save();
      return { success: true, message: 'Avaliação publicada com sucesso', rating: newRating, status: 201 };
    } catch (error) {
      console.error('Erro no RatingService.createRating:', error);
      if (error.name === 'ValidationError') {
        const validationErrors = {};
        Object.keys(error.errors).forEach(key => {
          validationErrors[key] = error.errors[key].message;
        });
        return { success: false, errors: validationErrors, status: 400 };
      }
      return { success: false, message: 'Erro interno do servidor ao publicar avaliação', status: 500 };
    }
  }

  static async getRatings() {
    try {
      return await Rating.find().populate('user', 'username'); // Popula o nome do usuário
    } catch (error) {
      console.error('Erro no RatingService.getRatings:', error);
      throw error;
    }
  }
}

module.exports = RatingService;
