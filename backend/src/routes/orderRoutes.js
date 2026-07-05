const express = require('express');
const order = require('../controllers/orderController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const r = express.Router();

r.use(auth);

r.post('/checkout', authorize('buyer'), order.checkout);
r.get('/', order.getOrders);
r.get('/:id', order.getOrder);
r.patch('/:id/status', authorize('seller', 'admin'), order.updateStatus);

module.exports = r;