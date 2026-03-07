import mongoose from "mongoose";

const medicamentoSchema = new mongoose.Schema({
  nombre: { type: String, required: true }, // ej: Ibuprofeno
  claseTerapeutica: String, // ej: aine
  grupo: String,
  
  // Relación con los Principios Activos (para el Diclo + B12 + Dexa)
  principiosActivos: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "PrincipioActivo" 
  }],
  
  esCombinacion: { type: Boolean, default: false },
  requiereReceta: { type: Boolean, default: false },
  nivelRiesgo: { type: String, enum: ["bajo", "medio", "alto"] },

  // Perfiles y Educación
  perfilDestacado: String,
  limitacionClave: String,
  preguntasClaveAntesDeVender: [String],
  tipsMostrador: [String],

  // Dosificación (Tus reglas de oro)
  dosisHabitual: {
    adulto: String,
    maximaDiaria: String
  },
  dosisPediatrica: {
    mgPorKg: Number,
    intervaloHoras: String,
    maximaMgKgDia: Number
  },
  
  // Aquí guardamos tus fórmulas mágicas
  reglasCalculo: [{
    presentacion: String, // ej: "Suspensión 2%"
    formula: String,      // ej: "Peso ÷ 2"
    detalle: String       // ej: "ml por dosis"
  }],
  
  reglasGotas: [{
    concentracion: String,
    regla: String,
    intervalo: String
  }],

  // Seguridad Clínica
  seguridad: {
    noDarSi: [String],
    precauciones: [String],
    efectosFrecuentes: [String],
    embarazo: { estado: String, texto: String }, // rojo, amarillo, verde
    lactancia: { estado: String, texto: String }
  },

  derivarSi: [String],

  // Formas Farmacéuticas detalladas
  formasFarmaceuticas: [{
    tipo: String,
    cuandoConviene: String,
    velocidadInicio: String,
    observaciones: String
  }],
  marcasComerciales: [String],
  variantes: String

});

// export default mongoose.model("Medicamento", medicamentoSchema);
export const Medicamento = mongoose.model("Medicamento", medicamentoSchema);