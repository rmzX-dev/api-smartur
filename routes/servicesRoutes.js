import express from 'express';
import ServicesController from '../controllers/serviceController.js';
import UserController from '../controllers/userController.js';
import upload from '../middleware/multer.js';

const router = express.Router();

router.post('/login', ServicesController.loginController);

router.post('/two-factor', ServicesController.verifyTwoStepVerificationCodeController);

router.post('/forgot', ServicesController.forgotPasswordController);

router.post('/reset', ServicesController.resetPasswordController);

router.post('/register', upload.single('image'), UserController.register);

// google auth
router.post('/google-login', UserController.googleLogin);

export default router;
