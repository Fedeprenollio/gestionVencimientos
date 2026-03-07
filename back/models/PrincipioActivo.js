import mongoose from "mongoose";

const PrincipioActivoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  clase: String, 
  mecanismoAccion: String,
  advertencias: [String],
  embarazoLactancia: {
    embarazo: { estado: String, texto: String },
    lactancia: { estado: String, texto: String }
  }
});

export const PrincipioActivo = mongoose.model("PrincipioActivo", PrincipioActivoSchema);