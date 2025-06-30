import express from 'express';
import {
  createBranch,
  getAllBranches,
  getBranchById,
  deleteBranch,
  updateBranch
} from '../controllers/branchController.js';

const branchRoutes = express.Router();

branchRoutes.post('/', createBranch);
branchRoutes.get('/', getAllBranches);
branchRoutes.get('/:id', getBranchById);
branchRoutes.delete('/:id', deleteBranch);
branchRoutes.put('/:id', updateBranch);


export default branchRoutes;
