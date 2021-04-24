const models = require('../models');
const { ApplicationError } = require('../helpers/errors');
const { generateAuthToken } = require('../helpers/auth');

const { User, BlacklistedToken } = models;

module.exports = {
  /**
   * @function signup
   * @description handles user signup
   *
   * @param {Object} request - the request object
   * @param {Object} response - the response object
   *
   * @returns {Function} creates a cookie from the response
   */
  signup: async (request, response) => {
    const { name, password, email } = request.body;

    const checkuser = await User.getExistinguser(email);

    if (checkuser) {
      throw new ApplicationError(409, 'Email exists, please try another');
    }

    const newUser = await User.create({
      name,
      password,
      email,
    });

    const token = generateAuthToken(newUser);

    return response.status(200).json({
      status: 'success',
      message: 'user registered',
      result: { user: newUser, token },
    });
  },

  /**
   * @function login
   * @description handles user login
   *
   * @param {Object} request - the request object
   * @param {Object} response - the response object
   *
   * @returns {Function} creates a cookie from the response
   */
  login: async (request, response) => {
    const { email, password } = request.body;
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      throw new ApplicationError(401, 'email or password is incorrect');
    }

    const checkPassword = user.validatePassword(password);
    if (!checkPassword) {
      throw new ApplicationError(401, 'email or password is incorrect');
    }

    const token = generateAuthToken(user);

    return response.status(200).json({
      status: 'success',
      message: 'user logged in successfully',
      result: { user, token },
    });
  },

  logout: async (request, response) => {
    const authHeader = request.headers.authorization;
    const token = authHeader.split(' ')[1];
    const { id } = request.user;

    await BlacklistedToken.create({ token, userId: id });

    response.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  },
};
