const express = require('express');
const order = require('../controllers/orderController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { orderValidation, orderStatusValidation } = require('../middleware/validation');

const router = express.Router();

router.get('/ref/:tx_ref', order.getByRef);
router.use(auth);

router.post('/checkout', authorize('buyer'), orderValidation, order.checkout);
router.get('/', order.getOrders);
router.get('/:id', order.getOrder);
router.patch('/:id/status', authorize('seller', 'admin'), orderStatusValidation, order.updateStatus);
router.post('/:id/pay', auth, authorize('buyer'), order.payOrder);

module.exports = router;