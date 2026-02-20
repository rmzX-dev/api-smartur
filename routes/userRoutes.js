import express from 'express';
import UserController from '../controllers/userController.js';

const router = express.Router();

router.get('/users', UserController.getAll);

router.get('/users/:id', UserController.getById);

router.get('/users/email/:email', UserController.findByEmail);

router.post('/users/', UserController.create);

router.delete('/users/:id', UserController.delete);

router.patch('/users/:id', UserController.patch);

export default router;