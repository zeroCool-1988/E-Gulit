const Category = require('../models/CategoryModel');
const log = require('../config/logger');

const category = {
  async findAll(req, res) {
    try {
      const categories = await Category.findAll();
      res.json({ success: true, data: categories });
    } catch (err) {
      log.error(`Category list error: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    }
  },
};

module.exports = category;
