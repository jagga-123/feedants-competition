const mongoose = require('mongoose');
const { param, body, query, validationResult } = require('express-validator');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const validateGetDetails = [
  param('id').custom(isValidObjectId).withMessage('Invalid competition id'),
  query('userId').optional().custom(isValidObjectId).withMessage('Invalid userId'),
  handleValidationErrors,
];

const validateRegister = [
  param('id').custom(isValidObjectId).withMessage('Invalid competition id'),
  body('userId')
    .notEmpty()
    .withMessage('userId is required')
    .bail()
    .custom(isValidObjectId)
    .withMessage('Invalid userId'),
  body('referralCode').optional().isString().withMessage('referralCode must be a string'),
  handleValidationErrors,
];

const validateSubmit = [
  param('id').custom(isValidObjectId).withMessage('Invalid competition id'),
  body('userId')
    .notEmpty()
    .withMessage('userId is required')
    .bail()
    .custom(isValidObjectId)
    .withMessage('Invalid userId'),
  body('fileUrl').notEmpty().withMessage('fileUrl is required').isString().withMessage('fileUrl must be a string'),
  handleValidationErrors,
];

const validateWinners = [
  param('id').custom(isValidObjectId).withMessage('Invalid competition id'),
  handleValidationErrors,
];

module.exports = {
  validateGetDetails,
  validateRegister,
  validateSubmit,
  validateWinners,
};
