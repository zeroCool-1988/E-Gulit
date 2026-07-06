const express = require('express');
const neg = require('../controllers/negotiationController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { negotiationValidation, negotiationResponseValidation } = require('../middleware/validation');

const router = express.Router();

router.use(auth);

router.post('/', authorize('buyer'), negotiationValidation, neg.create);
router.get('/seller', authorize('seller'), neg.getForSeller);
router.get('/buyer', authorize('buyer'), neg.getForBuyer);
router.get('/:id', neg.getById);
router.put('/:id/respond', negotiationResponseValidation, neg.respond);

module.exports = router;