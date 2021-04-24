const { check } = require('express-validator');

module.exports = {
  createPostSchema: [
    check('title')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Post title is required')
      .isLength({ max: 100 })
      .withMessage('Post title cannot be more than 100 characters'),

    check('body')
      .trim().not()
      .isEmpty()
      .withMessage('Post body is required'),
  ],
};
