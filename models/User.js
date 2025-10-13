// FileName: MultipleFiles/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  documentId: { type: String, required: true, unique: true },
  dateOfBirth: { type: Date, required: true },
  phone: { type: String, required: true },
  cep: { type: String, required: true },
  addressNumber: { type: String, required: true },
  addressComplement: { type: String }, // Complemento é opcional
  addressStreet: { type: String, required: true },
  addressNeighborhood: { type: String, required: true },
  otp: { type: String },
  otpExpiry: { type: Date },
});

module.exports = mongoose.model("User", UserSchema);
