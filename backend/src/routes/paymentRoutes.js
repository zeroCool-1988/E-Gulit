const express = require('express');
const payment = require('../controllers/paymentController');

const router = express.Router();
router.get('/webhook', payment.webhook);
router.post('/webhook', payment.webhook);
router.get('/callback', payment.callback);

module.exports = router;