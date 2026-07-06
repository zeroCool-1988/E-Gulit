const express = require('express');
const product = require('../controllers/productController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { productValidation } = require('../middleware/validation');

const router = express.Router();

router.get('/', product.findAll);
router.get('/:id', product.findById);
router.post('/', auth, authorize('seller', 'admin'), productValidation, product.create);
router.put('/:id', auth, authorize('seller', 'admin'), productValidation, product.update);
router.delete('/:id', auth, authorize('seller', 'admin'), product.delete);

module.exports = router;