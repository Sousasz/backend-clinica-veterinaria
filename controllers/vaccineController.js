const VaccineService = require('../models/VaccineService');

exports.createVaccine = async (req, res) => {
  const { name, description, type } = req.body;
  const result = await VaccineService.createVaccine({ name, description, type });
  res.status(result.status).json(result);
};

exports.getVaccines = async (req, res) => {
  const vaccines = await VaccineService.getVaccines();
  res.status(200).json(vaccines);
};

exports.updateVaccine = async (req, res) => {
  const { id } = req.params;
  const { name, description, type } = req.body;
  const result = await VaccineService.updateVaccine(id, { name, description, type });
  res.status(result.status).json(result);
};

exports.deleteVaccine = async (req, res) => {
  const { id } = req.params;
  const result = await VaccineService.deleteVaccine(id);
  res.status(result.status).json(result);
};
