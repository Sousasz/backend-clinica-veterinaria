const Service = require('../models/UserService');

exports.createService = async (req, res) => {
  const { name, description, price } = req.body;
  const newService = new Service({ name, description, price });
  await newService.save();
  
  res.status(201).json({ message: 'Service created successfully' });
};

exports.getServices = async (req, res) => {
  const services = await Service.find();
  res.json(services);
};
