import express from 'express';
import { 
  createLearningPlan, 
  getLearningPlanById, 
  updateLearningPlan, 
  deleteLearningPlan, 
  getAllLearningPlans 
} from '../controllers/planController.js';

const router = express.Router();

// Create a new learning plan
router.post('/', createLearningPlan);

// Get a learning plan by ID
router.get('/:id', getLearningPlanById);

// Update a learning plan by ID
router.put('/:id', updateLearningPlan);

// Delete a learning plan by ID
router.delete('/:id', deleteLearningPlan);

// Get all learning plans
router.get('/', getAllLearningPlans);

export default router;