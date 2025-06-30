// models/Branch.js
import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: String,
  // Podés tener usuarios asociados más adelante
});

export default mongoose.model('Branch', branchSchema);
