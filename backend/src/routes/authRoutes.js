const express = require('express');
const auth = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/refresh', auth.refresh);
router.get('/profile', authMiddleware, auth.profile);

module.exports = router;