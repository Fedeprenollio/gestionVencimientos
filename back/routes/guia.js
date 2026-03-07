// routes/guia.js
import express from 'express';
import { Patologia } from "../models/Patologia.js";
import { GrupoTerapeutico } from "../models/GrupoTerapeutico.js"; // <--- ESTO ES LO QUE FALTA
import { Medicamento } from "../models/Medicamento.js";           // <--- IMPORTALO TAMBIÉN PARA EL SIGUIENTE PASO
import { PrincipioActivo } from "../models/PrincipioActivo.js";

const router = express.Router();

// router.get('/patologia/:nombre', async (req, res) => {
//   try {
//     const data = await Patologia.findOne({ nombre: req.params.nombre })
//       .populate({
//         path: 'gruposRecomendados.grupo',
//         populate: {
//           path: 'farmacos',
//           populate: { path: 'principiosActivos' } // El triple join para llegar al fondo
//         }
//       });

//     if (!data) return res.status(404).json({ msg: "Patología no encontrada" });
    
//     res.json(data);
//   } catch (err) {
//     res.status(500).send("Error en el servidor");
//   }
// });


// Ruta A: Para el sidebar (nombres e IDs)
router.get("/lista-patologias", async (req, res) => {
  const lista = await Patologia.find({}, "nombre _id categoriaPadre");
  res.json(lista);
});

// Ruta B: El detalle "pesado" con el triple join
router.get("/patologia/:id", async (req, res) => {
  try {
    const detalle = await Patologia.findById(req.params.id)
      .populate({
        path: 'gruposRecomendados.grupo',
        populate: {
          path: 'farmacos', // <-- ESTO "abre" el array de IDs de fármacos
          populate: { 
            path: 'principiosActivos' // <-- ESTO "abre" los Principios Activos de cada fármaco
          }
        }
      });

    res.json(detalle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;