const crypto = require('crypto');
const { Op } = require('sequelize');
const models = require('../models');
const { ApplicationError, NotFoundError } = require('../helpers/errors');
const { generateAuthToken } = require('../helpers/auth');
const producer = require('../helpers/rabbitmq');

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

    producer.queue('SEND_WELCOME_EMAIL', { name, email });
    const token = generateAuthToken(newUser);

    return response.status(201).json({
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

  /**
   * @function resetPassword
   * @description sends email to reset password
   *
   * @param {Object} request - the request object
   * @param {Object} response - the response object
   *
   * @returns {Object} response object
   */
  resetPassword: async (request, response) => {
    const { email } = request.body;

    const user = await User.getExistinguser(email);

    if (!user) throw new NotFoundError();

    const resetToken = await user.generatePasswordResetToken();

    const resetURL = `${request.protocol}://${request.get(
      'host',
    )}/api/auth/update-password/${resetToken}`;

    producer.queue('SEND_PASSWORD_RESET_EMAIL', { user, resetURL });

    return response.status(200).json({
      status: 'success',
      // data: { resetURL },
      message: 'Password reset email sent successfully',
    });
  },
  // resetPassword: {},
  updatePassword: async (request, response) => {
    const hashedToken = crypto
      .createHash('sha256')
      .update(request.params.token)
      .digest('hex');

    const user = await User.findOne({
      where: {
        password_reset_token: hashedToken,
        password_token_expires_at: { [Op.gte]: Date.now() },
      },
    });

    // Check if token has not expired if user exists, then set password,
    if (!user) {
      throw new ApplicationError(400, 'Invalid Reset token');
    }
    user.password = request.body.password;
    user.password_reset_token = null;
    user.password_token_expires_at = null;

    await user.save();

    const token = generateAuthToken(user);

    return response.status(200).json({
      status: 'success',
      message: 'user password changed successfully',
      result: { user, token },
    });
  },

  changePassword: async (request, response) => {
    const { id } = request.user;
    const { oldPassword, newPassword } = request.body;

    const user = await User.findByPk(id);
    if (!user) throw new NotFoundError();

    const checkOldPassword = user.validatePassword(oldPassword);
    if (!checkOldPassword) {
      throw new ApplicationError(401, 'the old password you entered is wrong');
    }

    const checkNewPassword = user.validatePassword(newPassword);
    if (checkNewPassword) {
      throw new ApplicationError(400, "you can't use the old password again");
    }

    await user.update({ password: newPassword });

    const token = generateAuthToken(user);

    return response.status(200).json({
      status: 'success',
      message: 'password update successful',
      result: token,
    });
  },
};
