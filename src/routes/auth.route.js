const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const catchAsync = require('../helpers/catchAsync');
const authValidation = require('../validations/auth.validation');
const validator = require('../middleware/validator');
const { verifyToken } = require('../middleware/auth');

const { userLogInSchema, userSignUpSchema } = authValidation;

const { signup, login, logout } = authController;

const authRouter = Router();

authRouter.post('/signup', validator(userSignUpSchema), catchAsync(signup));
authRouter.post('/login', validator(userLogInSchema), catchAsync(login));
authRouter.post('/logout', verifyToken, catchAsync(logout));

module.exports = authRouter;
