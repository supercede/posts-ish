const { promisify } = require('util');
const { config } = require('dotenv');
const jwt = require('jsonwebtoken');
const models = require('../models');
const { ApplicationError } = require('../helpers/errors');
const catchAsync = require('../helpers/catchAsync');

const { JWT_SECRET } = process.env;
const { User, BlacklistedToken } = models;

config();
module.exports = {
  /**
   * Verify Token
   *
   * @param {Object} request - the request object
   * @param {Object} response - express response object
   * @param {Function} next
   *
   * @returns {void} - undefined
   */
  verifyToken: catchAsync(async (request, response, next) => {
    const authHeader = request.headers.authorization;

    if (authHeader === '') {
      throw new ApplicationError(
        400,
        'No token provided. Please signup or login',
      );
    }

    if (!authHeader) {
      throw new ApplicationError(412, 'Authorization header not set');
    }

    const token = authHeader.split(' ')[1];
    const blacklistedToken = await BlacklistedToken.findOne({
      where: { token },
    });

    if (blacklistedToken) {
      throw new ApplicationError(
        403,
        'Please login or signup to access this resource',
      );
    }

    // Verify Token
    const decoded = await promisify(jwt.verify)(token, JWT_SECRET);

    // Check if user exists
    const currentUser = await User.findByPk(decoded.id);
    if (!currentUser) {
      return next(new ApplicationError(403, 'Invalid Token'));
    }

    request.user = currentUser;

    return next();
  }),
};
