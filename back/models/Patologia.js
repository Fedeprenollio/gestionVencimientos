import mongoose from "mongoose";

const PatologiaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  categoriaPadre: { type: String, default: "Dolor" },
  descripcionBreve: String,
  triage: [{
    pregunta: String,
    alertaSi: { type: Boolean, default: false }
  }],
  clavesAtencion: [String],
  gruposRecomendados: [{
    grupo: { type: mongoose.Schema.Types.ObjectId, ref: "GrupoTerapeutico" },
    nota: String 
  }]
});

export const Patologia = mongoose.model("Patologia", PatologiaSchema);