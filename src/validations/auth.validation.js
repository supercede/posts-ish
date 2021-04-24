const { check } = require('express-validator');

module.exports = {
  userSignUpSchema: [
    check('name')
      .trim()
      .not()
      .isEmpty()
      .withMessage('name is required')
      .isLength({ min: 2, max: 30 })
      .withMessage('name should be between 2 to 30 characters')
      .matches(/^[a-zA-ZÀ-ÖØ-öø-ÿ '.-]*$/)
      .withMessage('Enter a valid name'),

    check('email')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Email address is required')
      .isEmail()
      .withMessage('Enter a valid email address'),

    check('password')
      .trim()
      .not()
      .isEmpty({ ignore_whitespace: true })
      .withMessage('Password is required')
      .isLength({ min: 8 })
      .withMessage('Password should be between at least 8 characters'),
  ],

  userLogInSchema: [
    check('email')
      .trim()
      .not()
      .isEmpty()
      .withMessage('email is required')
      .isEmail()
      .withMessage('Enter a valid email address'),

    check('password')
      .trim()
      .not()
      .isEmpty({ ignore_whitespace: true })
      .withMessage('This field is required')
      .isLength({ min: 8 })
      .withMessage('Password should be between at least 8 characters'),
  ],

  resetPasswordSchema: [
    check('email')
      .trim()
      .not()
      .isEmpty()
      .withMessage('email is required')
      .isEmail()
      .withMessage('Enter a valid email address'),
  ],

  updatePasswordSchema: [
    check('password')
      .trim()
      .not()
      .isEmpty({ ignore_whitespace: true })
      .withMessage('This field is required')
      .isLength({ min: 8 })
      .withMessage('Password should be between at least 8 characters'),
  ],

  changePasswordSchema: [
    check('oldPassword')
      .trim()
      .not()
      .isEmpty({ ignore_whitespace: true })
      .withMessage('This field is required')
      .isLength({ min: 8 })
      .withMessage('Old password should be between at least 8 characters'),

    check('newPassword')
      .trim()
      .not()
      .isEmpty({ ignore_whitespace: true })
      .withMessage('This field is required')
      .isLength({ min: 8 })
      .withMessage('New password should be between at least 8 characters'),
  ],
};
