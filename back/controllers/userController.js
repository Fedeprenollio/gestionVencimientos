import User from "../models/User.js";

// Obtener todos los usuarios
// controllers/userController.js
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "fullname username _id").sort("fullname");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};


// Crear un nuevo usuario
// export const createUser = async (req, res) => {
//   try {
//     const { username } = req.body;

//     if (!username) {
//       return res.status(400).json({ message: "El nombre de usuario es obligatorio" });
//     }

//     const existing = await User.findOne({ username });
//     if (existing) {
//       return res.status(400).json({ message: "El usuario ya existe" });
//     }

//     const user = new User({ username });
//     await user.save();

//     res.status(201).json({ user });
//   } catch (error) {
//     console.error("Error al crear usuario:", error);
//     res.status(500).json({ message: "Error al crear usuario" });
//   }
// };
