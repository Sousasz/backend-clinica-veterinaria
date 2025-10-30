const MedicineService = require('../models/MedicineService');

exports.createMedicine = async (req, res) => {
  const { name, description, type } = req.body;
  const result = await MedicineService.createMedicine({ name, description, type });
  res.status(result.status).json(result);
};

exports.getMedicines = async (req, res) => {
  const medicines = await MedicineService.getMedicines();
  res.status(200).json(medicines);
};

exports.updateMedicine = async (req, res) => {
  const { id } = req.params;
  const { name, description, type } = req.body;
  const result = await MedicineService.updateMedicine(id, { name, description, type });
  res.status(result.status).json(result);
};

exports.deleteMedicine = async (req, res) => {
  const { id } = req.params;
  const result = await MedicineService.deleteMedicine(id);
  res.status(result.status).json(result);
};
