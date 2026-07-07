const express = require('express');
const auth = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { registerValidation, loginValidation, emailValidation, resetPasswordValidation } = require('../middleware/validation');

const router = express.Router();

router.post('/register', registerValidation, auth.register);
router.get('/check-username', auth.checkUsername);
router.post('/login', loginValidation, auth.login);
router.post('/refresh', auth.refresh);
router.get('/profile', authMiddleware, auth.profile);
router.get('/verify/:token', auth.verify);
router.post('/resend-verification', emailValidation, auth.resendVerification);
router.post('/forgot-password', emailValidation, auth.forgotPassword);
router.post('/reset-password', resetPasswordValidation, auth.resetPassword);

module.exports = router;