const express = require('express');
const category = require('../controllers/categoryController');

const router = express.Router();

router.get('/', category.findAll);

module.exports = router;
