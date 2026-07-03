const express = require('express');
const product = require('../controllers/productController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.get('/', product.findAll);
router.get('/:id', product.findById);
router.post('/', auth, authorize('seller', 'admin'), product.create);
router.put('/:id', auth, authorize('seller', 'admin'), product.update);
router.delete('/:id', auth, authorize('seller', 'admin'), product.delete);

module.exports = router;
