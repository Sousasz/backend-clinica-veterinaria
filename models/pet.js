// FileName: MultipleFiles/Pet.js
const mongoose = require('mongoose');

const PetSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  species: { type: String, required: true },
  breed: { type: String, required: true },
  age: { type: Number, required: true },
  neutered: { type: Boolean, required: true },
  sex: { type: String, enum: ['M', 'F'], required: true },
  weight: { type: Number, required: true },
  temperament: { type: String, required: true },
});

module.exports = mongoose.model('Pet', PetSchema);
