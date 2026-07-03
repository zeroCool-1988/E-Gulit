const express = require('express');
const cart = require('../controllers/cartController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const r = express.Router();

r.use(auth);
r.use(authorize('buyer'));

r.get('/', cart.get);
r.post('/', cart.add);
r.put('/:item_id', cart.update);
r.delete('/:item_id', cart.remove);

module.exports = r;