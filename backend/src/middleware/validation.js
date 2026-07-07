const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

const registerValidation = [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['buyer', 'seller', 'admin']).withMessage('Role must be buyer, seller, or admin'),
  validate
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

const emailValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  validate
];

const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
];

const productValidation = [
  body('product_name').notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
  body('quantity_in_stock').optional().isInt({ min: 0 }).withMessage('Quantity must be 0 or greater'),
  body('product_condition').optional().isIn(['new', 'used', 'refurbished']).withMessage('Invalid condition'),
  validate
];

const cartValidation = [
  body('product_id').custom(value => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new Error('Valid product ID is required');
    }
    return true;
  }),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  validate
];

const cartUpdateValidation = [
  param('item_id').isUUID().withMessage('Invalid cart item ID'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be 0 or greater'),
  validate
];

const orderValidation = [
  body('address').notEmpty().withMessage('Delivery address is required'),
  validate
];

const negotiationValidation = [
  body('product_id').isUUID().withMessage('Valid product ID is required'),
  body('offered_price').isFloat({ min: 0.01 }).withMessage('Offer price must be greater than 0'),
  validate
];

const negotiationResponseValidation = [
  param('id').isUUID().withMessage('Invalid negotiation ID'),
  body('action').isIn(['accept', 'counter', 'reject']).withMessage('Action must be accept, counter, or reject'),
  body('counter_price').optional().isFloat({ min: 0.01 }).withMessage('Counter price must be greater than 0'),
  validate
];

const orderStatusValidation = [
  param('id').isUUID().withMessage('Invalid order ID'),
  body('status').isIn(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  emailValidation,
  resetPasswordValidation,
  productValidation,
  cartValidation,
  cartUpdateValidation,
  orderValidation,
  negotiationValidation,
  negotiationResponseValidation,
  orderStatusValidation
};