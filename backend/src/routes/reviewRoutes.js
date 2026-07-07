const express = require('express');
const review = require('../controllers/reviewController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.get('/product/:product_id', review.getByProduct);
router.get('/me', auth, authorize('buyer'), review.getByUser);
router.post('/', auth, authorize('buyer'), review.create);
router.delete('/:id', auth, review.delete);

module.exports = router;