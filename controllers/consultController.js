const Consult = require('../models/Consult');

const getUserConsults = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const consults = await Consult.find({ userId })
      .populate('petId', 'name') 
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalConsults = await Consult.countDocuments({ userId });

    res.json({
      consults: consults.map(consult => ({
        id: consult._id,
        petName: consult.petId?.name || 'Pet não encontrado',
        date: consult.date,
        description: consult.description,
        status: consult.status,
        createdAt: consult.createdAt,
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalConsults / limit),
        totalConsults,
      },
    });
  } catch (err) {
    console.error('Erro ao buscar consultas do usuário:', err.message);
    res.status(500).json({ msg: 'Erro interno do servidor' });
  }
};

module.exports = {
  getUserConsults,
};