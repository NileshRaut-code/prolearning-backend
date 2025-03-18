import express from 'express';
import { getAllUsersForSuperadmin, changeUserRole, deleteUserBySuperadmin } from '../controllers/superadminController.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';
import { verifySuperadmin } from '../middlewares/superadmin.middlewares.js';

const router = express.Router();



router.get('/users', verifyJWT, verifySuperadmin,getAllUsersForSuperadmin);
router.put('/change-role',verifyJWT, verifySuperadmin, changeUserRole);
router.delete('/deleteuser',verifyJWT, verifySuperadmin, deleteUserBySuperadmin);

export default router;
