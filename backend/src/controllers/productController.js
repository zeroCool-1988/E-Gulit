const Product = require('../models/ProductModel');
const log = require('../config/logger');
const path = require('path');
const { getFileUrl, validateFiles } = require('../config/upload');
const MAX_IMAGES = 5;

const product = {
  async create(req, res) {
    const { category_id, product_name, description, price, quantity_in_stock, product_condition, is_negotiable, is_featured } = req.body;

    if (!product_name || !price) {
      return res.status(400).json({ success: false, message: 'Name and price required' });
    }

    try {
      let imageUrls = null;
      if (req.files && req.files.length > 0) {
        const { valid } = validateFiles(req);
        if (valid.length > 0) {
          imageUrls = valid.map(f => getFileUrl(req, path.basename(f.path)));
        }
      }

      const product = await Product.create({
        seller_id: req.user.id,
        category_id,
        product_name,
        description,
        price,
        quantity_in_stock: quantity_in_stock || 0,
        product_condition: product_condition || 'new',
        is_negotiable: is_negotiable === 'true' || is_negotiable === true,
        is_featured: is_featured === 'true' || is_featured === true,
        images: imageUrls,
      });

      res.status(201).json({ success: true, data: product });
    } catch (err) {
      log.error(`Product create error: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to create product' });
    }
  },

  async findAll(req, res) {
    const { search, category_id, min_price, max_price, is_negotiable, seller_id, limit, page } = req.query;

    const filters = {
      search: search || null,
      category_id: category_id || null,
      min_price: min_price || null,
      max_price: max_price || null,
      is_negotiable: is_negotiable !== undefined ? is_negotiable === 'true' : undefined,
      seller_id: seller_id || null,
      limit: parseInt(limit) || 50,
      offset: (parseInt(page) - 1) * parseInt(limit) || 0,
    };

    try {
      const products = await Product.findAll(filters);
      res.json({ success: true, data: products });
    } catch (err) {
      log.error(`Product list error: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
  },

  async findById(req, res) {
    const { id } = req.params;

    try {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      await Product.incrementViews(id);
      res.json({ success: true, data: product });
    } catch (err) {
      log.error(`Product detail error: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to fetch product' });
    }
  },

  async update(req, res) {
    const { id } = req.params;
    const { category_id, product_name, description, price, quantity_in_stock, product_condition, is_negotiable, is_featured } = req.body;

    try {
      const existing = await Product.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      if (existing.seller_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not your product' });
      }

      let allImages = [];

      if (req.body.existing_images) {
        try {
          const parsed = JSON.parse(req.body.existing_images);
          if (Array.isArray(parsed)) {
            allImages = parsed;
          }
        } catch (e) {
        }
      }

      if (req.files && req.files.length > 0) {
        const newImages = req.files.map(f => getFileUrl(req, f.filename));
        const remainingSlots = MAX_IMAGES - allImages.length;
        if (remainingSlots > 0 && newImages.length > 0) {
          allImages = [...allImages, ...newImages.slice(0, remainingSlots)];
        }
      }

      const images = allImages.length > 0 ? allImages : null;

      const product = await Product.update(id, {
        category_id,
        product_name,
        description,
        price,
        quantity_in_stock,
        product_condition,
        is_negotiable: is_negotiable === 'true' || is_negotiable === true,
        is_featured: is_featured === 'true' || is_featured === true,
        images,
      });

      res.json({ success: true, data: product });
    } catch (e) {
      log.error(`Product update error: ${e.message}`);
      res.status(500).json({ success: false, message: 'Failed to update product' });
    }
  },

  async delete(req, res) {
    const { id } = req.params;

    try {
      const existing = await Product.findById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      if (existing.seller_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not your product' });
      }

      await Product.delete(id);
      res.json({ success: true, message: 'Product deleted' });
    } catch (err) {
      log.error(`Product delete error: ${err.message}`);
      res.status(500).json({ success: false, message: 'Failed to delete product' });
    }
  },
};

module.exports = product;