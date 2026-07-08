const pool = require('../config/database');
const log = require('../config/logger');

const User = {
  async findByEmail(email) {
    try {
      const result = await pool.query(
        `SELECT u.*, sp.store_name, sp.stall_location, sp.bio, sp.rating, sp.review_count
         FROM users u
         LEFT JOIN seller_profiles sp ON u.id = sp.user_id
         WHERE u.email = $1`,
        [email]
      );
      return result.rows[0] || null;
    } catch (err) {
      log.error(`findByEmail error: ${err.message}`);
      throw err;
    }
  },

  async findByUsername(username) {
    try {
      const result = await pool.query(
        'SELECT id, username FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1',
        [username]
      );
      return result.rows[0] || null;
    } catch (err) {
      log.error(`findByUsername error: ${err.message}`);
      throw err;
    }
  },

  async findById(id) {
    try {
      const result = await pool.query(
        `SELECT u.id, u.username, u.email, u.full_name, u.account_role, u.phone_number,
                u.is_verified_seller, u.is_email_verified, u.wallet_balance, u.created_at,
                sp.store_name, sp.stall_location, sp.bio, sp.rating, sp.review_count
         FROM users u
         LEFT JOIN seller_profiles sp ON u.id = sp.user_id
         WHERE u.id = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (err) {
      log.error(`findById error: ${err.message}`);
      throw err;
    }
  },

  async create(data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `INSERT INTO users (username, email, password_hash, full_name, account_role, phone_number)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, username, email, full_name, account_role, phone_number, is_verified_seller, wallet_balance`,
        [
          data.username,
          data.email,
          data.password_hash,
          data.full_name || null,
          data.account_role,
          data.phone_number || null,
        ]
      );

      const user = result.rows[0];

      if (data.account_role === 'seller') {
        const firstName = (user.full_name || user.username || '').split(/\s+/)[0] || user.username || 'Seller';
        const storeName = data.store_name?.trim() || `${firstName}'s Store`;
        await client.query(
          `INSERT INTO seller_profiles (user_id, store_name, stall_location)
           VALUES ($1, $2, $3)`,
          [user.id, storeName, data.stall_location || null]
        );
      }

      await client.query('COMMIT');
      log.info(`User created: ${data.email}`);
      return user;
    } catch (err) {
      await client.query('ROLLBACK');
      log.error(`User create error: ${err.message}`);
      throw err;
    } finally {
      client.release();
    }
  },

  async getAddresses(userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC',
        [userId]
      );
      return result.rows;
    } catch (err) {
      log.error(`getAddresses error: ${err.message}`);
      throw err;
    }
  },

  async addAddress(userId, data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      if (data.is_default) {
        await client.query(
          'UPDATE addresses SET is_default = FALSE WHERE user_id = $1',
          [userId]
        );
      }

      const result = await client.query(
        `INSERT INTO addresses (user_id, label, street, city, region, postal_code, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          userId,
          data.label || 'Home',
          data.street,
          data.city || 'Addis Ababa',
          data.region || null,
          data.postal_code || null,
          data.is_default || false,
        ]
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      log.error(`addAddress error: ${err.message}`);
      throw err;
    } finally {
      client.release();
    }
  },

  async updateBalance(userId, amount) {
    try {
      const result = await pool.query(
        'UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2 RETURNING wallet_balance',
        [amount, userId]
      );
      log.info(`Balance updated for user ${userId}: +${amount}`);
      return result.rows[0].wallet_balance;
    } catch (err) {
      log.error(`updateBalance error: ${err.message}`);
      throw err;
    }
  },

  async updateSellerProfile(userId, data) {
    try {
      const result = await pool.query(
        `UPDATE seller_profiles
         SET store_name = COALESCE($1, store_name),
             stall_location = COALESCE($2, stall_location),
             bio = COALESCE($3, bio),
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $4
         RETURNING *`,
        [data.store_name, data.stall_location, data.bio, userId]
      );

      if (result.rows.length === 0) {
        const insertResult = await pool.query(
          `INSERT INTO seller_profiles (user_id, store_name, stall_location, bio)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [userId, data.store_name || 'My Store', data.stall_location || null, data.bio || null]
        );
        return insertResult.rows[0];
      }

      return result.rows[0];
    } catch (err) {
      log.error(`updateSellerProfile error: ${err.message}`);
      throw err;
    }
  },

  async verifySeller(userId) {
    try {
      const result = await pool.query(
        'UPDATE users SET is_verified_seller = TRUE WHERE id = $1 RETURNING id, username, email, is_verified_seller',
        [userId]
      );
      log.info(`Seller verified: ${userId}`);
      return result.rows[0];
    } catch (err) {
      log.error(`verifySeller error: ${err.message}`);
      throw err;
    }
  },
  
  async setVerificationToken(userId, token, expires) {
    try {
      const result = await pool.query(
        'UPDATE users SET verification_token = $1, verification_expires = $2 WHERE id = $3 RETURNING id',
        [token, expires, userId]
      );
      return result.rows[0] || null;
    } catch (err) {
      log.error(`setVerificationToken error: ${err.message}`);
      throw err;
    }
  },

  async verifyEmail(token) {
    try {
      const result = await pool.query(
        `UPDATE users 
         SET is_email_verified = TRUE, 
             verification_token = NULL, 
             verification_expires = NULL 
         WHERE verification_token = $1 AND verification_expires > NOW() 
         RETURNING id, email`,
        [token]
      );
      return result.rows[0] || null;
    } catch (err) {
      log.error(`verifyEmail error: ${err.message}`);
      throw err;
    }
  },

  async setResetToken(userId, token, expires) {
    try {
      const result = await pool.query(
        'UPDATE users SET reset_token = $1, reset_expires = $2 WHERE id = $3 RETURNING id',
        [token, expires, userId]
      );
      return result.rows[0] || null;
    } catch (err) {
      log.error(`setResetToken error: ${err.message}`);
      throw err;
    }
  },

  async resetPassword(token, newHash) {
    try {
      const result = await pool.query(
        `UPDATE users 
         SET password_hash = $1, 
             reset_token = NULL, 
             reset_expires = NULL 
         WHERE reset_token = $2 AND reset_expires > NOW() 
         RETURNING id, email`,
        [newHash, token]
      );
      return result.rows[0] || null;
    } catch (err) {
      log.error(`resetPassword error: ${err.message}`);
      throw err;
    }
  },
};

module.exports = User;