const express = require('express');
const admin = require('../controllers/adminController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.use(auth);
router.use(authorize('admin'));

router.get('/users', admin.getUsers);
router.get('/products', admin.getProducts);
router.get('/orders', admin.getOrders);
router.get('/stats', admin.getStats);
router.patch('/users/:id/verify', admin.verifySeller);
router.delete('/products/:id', admin.deleteProduct);

module.exports = router;
