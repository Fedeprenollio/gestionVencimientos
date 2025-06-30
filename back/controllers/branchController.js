// controllers/branchController.js
import Branch from '../models/Branch.js';

export const createBranch = async (req, res) => {
  const {name, location} = req.body
  console.log("CREAR SUCURSA",name, location)
  try {
    const branch = new Branch(req.body);
    await branch.save();
    res.status(201).json(branch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.find();
    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) return res.status(404).json({ message: 'Sucursal no encontrada' });
    res.json(branch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBranch = async (req, res) => {
  try {
    const result = await Branch.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: 'Sucursal no encontrada' });
    res.json({ message: 'Sucursal eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Branch.findByIdAndUpdate(id, req.body, {
      new: true, // devuelve el documento actualizado
      runValidators: true, // aplica validaciones del schema
    });

    if (!updated) {
      return res.status(404).json({ message: 'Sucursal no encontrada' });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
