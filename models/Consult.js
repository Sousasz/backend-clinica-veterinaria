// models/Consult.js
const mongoose = require("mongoose");

const ConsultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true }, 
  date: { type: Date, required: true },
  description: { type: String, required: true }, 
  status: { type: String, enum: ['agendada', 'realizada', 'cancelada'], default: 'agendada' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Consult", ConsultSchema);