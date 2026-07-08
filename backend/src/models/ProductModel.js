const pool = require('../config/database');
const log = require('../config/logger');

const Product = {
  async create(data) {
    const { seller_id, category_id, product_name, description, price, quantity_in_stock, product_condition, is_negotiable, is_featured, images } = data;

    try {
      const result = await pool.query(
        `INSERT INTO products 
         (seller_id, category_id, product_name, description, price, quantity_in_stock, product_condition, is_negotiable, is_featured, images)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [seller_id, category_id || null, product_name, description || null, price, quantity_in_stock || 0, product_condition || 'new', is_negotiable || false, is_featured || false, images || null]
      );

      log.info(`Product created: ${product_name}`);
      return result.rows[0];
    } catch (err) {
      log.error(`Product create error: ${err.message}`);
      throw err;
    }
  },

  async findAll(filters = {}) {
    let query = `SELECT p.*, u.username as seller_name, u.is_verified_seller,
                        c.category_name, sp.store_name
                FROM products p
                LEFT JOIN users u ON p.seller_id = u.id
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN seller_profiles sp ON u.id = sp.user_id
                WHERE 1=1`;
    const values = [];
    let idx = 1;

    if (filters.search) {
      query += ` AND p.product_name ILIKE $${idx}`;
      values.push(`%${filters.search}%`);
      idx++;
    }

    if (filters.category_id) {
      query += ` AND p.category_id = $${idx}`;
      values.push(filters.category_id);
      idx++;
    }

    if (filters.min_price) {
      query += ` AND p.price >= $${idx}`;
      values.push(filters.min_price);
      idx++;
    }

    if (filters.max_price) {
      query += ` AND p.price <= $${idx}`;
      values.push(filters.max_price);
      idx++;
    }

    if (filters.is_negotiable !== undefined) {
      query += ` AND p.is_negotiable = $${idx}`;
      values.push(filters.is_negotiable);
      idx++;
    }
    if (filters.seller_id) {
      query += ` AND p.seller_id = $${idx}`;
      values.push(filters.seller_id);
      idx++;
    }
    query += ` ORDER BY p.created_at DESC`;

    if (filters.limit) {
      query += ` LIMIT $${idx}`;
      values.push(filters.limit);
      idx++;
    }

    if (filters.offset) {
      query += ` OFFSET $${idx}`;
      values.push(filters.offset);
    }

    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (err) {
      log.error(`Product findAll error: ${err.message}`);
      throw err;
    }
  },

  async findById(id) {
    try {
      const result = await pool.query(
        `SELECT p.*, u.username as seller_name, u.is_verified_seller,
                c.category_name, sp.store_name, sp.rating, sp.review_count
         FROM products p
         LEFT JOIN users u ON p.seller_id = u.id
         LEFT JOIN categories c ON p.category_id = c.id
         LEFT JOIN seller_profiles sp ON u.id = sp.user_id
         WHERE p.id = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (err) {
      log.error(`Product findById error: ${err.message}`);
      throw err;
    }
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined && val !== null) {
        fields.push(`${key} = $${idx}`);
        values.push(val);
        idx++;
      }
    }

    if (fields.length === 0) {
      return null;
    }

    values.push(id);
    const query = `UPDATE products SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`;

    try {
      const result = await pool.query(query, values);
      log.info(`Product updated: ${id}`);
      return result.rows[0] || null;
    } catch (err) {
      log.error(`Product update error: ${err.message}`);
      throw err;
    }
  },

  async delete(id) {
    try {
      const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
      log.info(`Product deleted: ${id}`);
      return result.rows[0] || null;
    } catch (err) {
      log.error(`Product delete error: ${err.message}`);
      throw err;
    }
  },

  async incrementViews(id) {
    try {
      await pool.query('UPDATE products SET view_count = view_count + 1 WHERE id = $1', [id]);
    } catch (err) {
      log.error(`incrementViews error: ${err.message}`);
    }
  },
};

module.exports = Product;