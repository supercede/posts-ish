/* eslint-disable implicit-arrow-linebreak */
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Generates user token
 *
 * @function
 *
 * @param {Object} user - token payload
 *
 * @returns {string} - token
 */
const generateAuthToken = ({ id }) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });

module.exports = { generateAuthToken };
