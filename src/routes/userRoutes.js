import express from 'express';
import {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  refreshToken,
  logoutUser,
  getCurrentUser,
} from '../controllers/userController.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh-token',verifyJWT, refreshToken);
router.post('/logout',verifyJWT, logoutUser);
// router.get('/',verifyJWT, getAllUsers);
// router.get('/:id',verifyJWT, getUserById);
// router.put('/:id',verifyJWT, updateUser);
router.delete('/:id',verifyJWT, deleteUser);
router.get('/current-user',verifyJWT, getCurrentUser);



export default router;
