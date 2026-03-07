import mongoose from "mongoose";
import dotenv from "dotenv";

// Cargar variables de entorno
import path from 'path';
import { fileURLToPath } from 'url';

// Estas dos líneas son para obtener la ruta actual en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Busca el .env subiendo dos niveles (desde scripts/ a back/ y luego a la raíz)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log("URI cargada:", process.env.MONGO_URI); // Ahora debería mostrarse

// Importación de modelos (ajusta las rutas según tu estructura de carpetas)
import { PrincipioActivo } from "../models/PrincipioActivo.js";
import { Medicamento } from "../models/Medicamento.js";
import { GrupoTerapeutico } from "../models/GrupoTerapeutico.js";
import { Patologia } from "../models/Patologia.js";

const MONGO_URI = process.env.MONGO_URI;
console.log(MONGO_URI)
const seedDB = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("La variable MONGO_URI no está definida en el .env");
    }

    await mongoose.connect(MONGO_URI);
    console.log("✅ Conectado a MongoDB para la carga de la Guía...");

    // 0. Limpieza de datos previos (Solo de la Guía)
    // Cuidado: Esto borra lo que haya en estas colecciones antes de insertar
    await Patologia.deleteMany({});
    await GrupoTerapeutico.deleteMany({});
    await Medicamento.deleteMany({});
    await PrincipioActivo.deleteMany({});
    console.log("🗑️  Colecciones de la guía limpiadas.");

    // 1. Crear Principios Activos
    console.log("🧪 Creando Principios Activos...");
    const paDipirona = await PrincipioActivo.create({
      nombre: "Dipirona (Metamizol)",
      clase: "Analgésico / Antipirético",
      mecanismoAccion: "Inhibe prostaglandinas y actúa sobre el sistema colinérgico.",
      advertencias: ["Riesgo de agranulocitosis", "Evitar en porfiria"],
      embarazoLactancia: {
        embarazo: { estado: "amarillo", texto: "Valorar riesgo/beneficio" },
        lactancia: { estado: "verde", texto: "Seguro" },
      },
    });

    const paErgotamina = await PrincipioActivo.create({
      nombre: "Ergotamina",
      clase: "Vasoconstrictor",
      mecanismoAccion: "Agonista serotoninérgico, provoca vasoconstricción de arterias craneales.",
      advertencias: ["No usar en hipertensos", "No usar en enfermedad coronaria"],
      embarazoLactancia: {
        embarazo: { estado: "rojo", texto: "CONTRAINDICADO (Oxitócico)" },
        lactancia: { estado: "rojo", texto: "Evitar" },
      },
    });

    const paCafeina = await PrincipioActivo.create({
      nombre: "Cafeína",
      clase: "Estimulante / Coadyuvante",
      mecanismoAccion: "Potencia la absorción de la ergotamina y produce vasoconstricción suave.",
      advertencias: ["Puede causar insomnio o taquicardia"],
      embarazoLactancia: {
        embarazo: { estado: "verde", texto: "Moderación (<200mg/día)" },
        lactancia: { estado: "verde", texto: "Seguro" },
      },
    });

    // 2. Crear el Medicamento (Combo)
    console.log("💊 Creando Medicamento Combinado...");
    const medMigral = await Medicamento.create({
      nombre: "Antimigrañoso Compuesto (Tipo Migral/Tetralgin)",
      esCombinacion: true,
      principiosActivos: [paDipirona._id, paErgotamina._id, paCafeina._id],
      perfilDestacado: "Tratamiento de rescate para crisis de migraña instaladas.",
      preguntasClave: [
        "¿Es hipertenso?",
        "¿Cuántos tomó esta semana?",
        "¿Tiene náuseas?",
      ],
      tipsMostrador: [
        "Tomar al primer síntoma de aura",
        "No superar 2 dosis diarias",
        "Limitar a máximo 6 comp. por semana para evitar cefalea por rebote",
      ],
      seguridad: {
        noDarSi: ["Embarazo", "Cardiopatías", "Insuficiencia renal"],
        precauciones: ["Mayores de 65 años", "Uso de otros vasoconstrictores"],
      },
    });

    // 3. Crear el Grupo Terapéutico
    console.log("📂 Creando Grupo Terapéutico...");
    const grupoAntimigra = await GrupoTerapeutico.create({
      titulo: "Antimigrañosos con Ergotamina",
      explicacion: "Combos diseñados para atacar la migraña por múltiples vías (dolor + dilatación vascular).",
      pros: "Muy eficaces en crisis agudas.",
      contras: "Riesgo de ergotismo y cefalea de rebote por uso crónico.",
      farmacos: [medMigral._id],
    });

    // 4. Crear la Patología
    console.log("🧠 Creando Patología: Migraña...");
    await Patologia.create({
      nombre: "Migraña",
      categoriaPadre: "Dolor",
      descripcionBreve: "Dolor pulsátil, generalmente de un solo lado de la cabeza, a menudo acompañado de náuseas y sensibilidad a la luz.",
      triage: [
        { pregunta: "¿El dolor late de un solo lado?", alertaSi: false },
        { pregunta: "¿Tiene náuseas o le molesta la luz?", alertaSi: false },
        {
          pregunta: "¿Siente debilidad en un brazo o dificultad para hablar?",
          alertaSi: true,
        },
      ],
      clavesAtencion: [
        "Recomendar reposo en penumbra",
        "La eficacia baja si se toma tarde en la crisis",
      ],
      gruposRecomendados: [
        {
          grupo: grupoAntimigra._id,
          nota: "Solo para ataques de migraña confirmados, no para cefalea tensional.",
        },
      ],
    });

    console.log("🚀 ¡Carga exitosa! La base de datos de la Guía ha sido inicializada.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error cargando datos:", err);
    process.exit(1);
  }
};

seedDB();