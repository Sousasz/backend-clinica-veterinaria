const mongoose = require('mongoose');

const VaccineSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  type: { type: String, enum: ['for-dogs', 'for-cats'], required: true },
});

module.exports = mongoose.model('Vaccine', VaccineSchema);

