import mongoose from "mongoose";

const GrupoTerapeuticoSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  explicacion: String,
  pros: String,
  contras: String,
  seguridadResumen: String,
  farmacos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Medicamento" }]
});

export const GrupoTerapeutico = mongoose.model("GrupoTerapeutico", GrupoTerapeuticoSchema);