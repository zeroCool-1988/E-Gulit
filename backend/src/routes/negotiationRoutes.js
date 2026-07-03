const express = require('express');
const neg = require('../controllers/negotiationController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const r = express.Router();

r.use(auth);

r.post('/', authorize('buyer'), neg.create);
r.get('/seller', authorize('seller'), neg.getForSeller);
r.get('/buyer', authorize('buyer'), neg.getForBuyer);
r.get('/:id', neg.getById);
r.put('/:id/respond', neg.respond);

module.exports = r;