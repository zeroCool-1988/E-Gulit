const express = require('express');
const payment = require('../controllers/paymentController');

const r = express.Router();

r.post('/webhook', payment.webhook);
r.get('/callback', payment.callback);

module.exports = r;