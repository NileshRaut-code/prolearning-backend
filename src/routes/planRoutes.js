import express from 'express';
import { 
  createLearningPlan, 
  getLearningPlanById, 
  updateLearningPlan, 
  deleteLearningPlan, 
  getAllLearningPlans,
  getLearningPlansByStudentId,
  markTopicCompleted,
  updateTopicProgress,
  getLearningPlanWithProgress
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

// Get learning plans by student ID
router.get('/student/:studentId', getLearningPlansByStudentId);

// Get learning plan with detailed progress
router.get('/progress/:id', getLearningPlanWithProgress);

// Mark topic as completed
router.put('/:planId/topic/:topicId/complete', markTopicCompleted);

// Update topic progress
router.put('/:planId/topic/:topicId/progress', updateTopicProgress);

export default router;