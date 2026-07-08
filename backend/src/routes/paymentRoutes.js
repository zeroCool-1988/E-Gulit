const express = require('express');
const payment = require('../controllers/paymentController');

const router = express.Router();
router.all('/webhook', payment.webhook);
router.get('/callback', payment.callback);

module.exports = router;