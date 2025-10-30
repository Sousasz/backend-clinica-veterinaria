const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  type: { type: String, enum: ['injectables-medicines', 'no-injectables-medicines'], required: true },
});

module.exports = mongoose.model('Medicine', MedicineSchema);


