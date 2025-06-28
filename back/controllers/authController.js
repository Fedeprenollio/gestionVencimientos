// controllers/authController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";

// REGISTRO
export const register = async (req, res) => {
  const { username, fullname, password, role } = req.body;

  try {
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "Usuario ya existe" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({ username, fullname, passwordHash, role });
    await newUser.save();

    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al registrar usuario" });
  }
};

// LOGIN
export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        fullname: user.fullname,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error en login" });
  }
};
