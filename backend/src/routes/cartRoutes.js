const express = require('express');
const cart = require('../controllers/cartController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { cartValidation, cartUpdateValidation } = require('../middleware/validation');

const router = express.Router();

router.use(auth);
router.use(authorize('buyer'));

router.get('/', cart.get);
router.post('/', cartValidation, cart.add);
router.put('/:item_id', cartUpdateValidation, cart.update);
router.delete('/:item_id', cart.remove);

module.exports = router;