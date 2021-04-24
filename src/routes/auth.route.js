const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const catchAsync = require('../helpers/catchAsync');
const authValidation = require('../validations/auth.validation');
const validator = require('../middleware/validator');
const { verifyToken } = require('../middleware/auth');

const {
  userLogInSchema,
  userSignUpSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  changePasswordSchema,
} = authValidation;

const {
  signup,
  login,
  logout,
  resetPassword,
  updatePassword,
  changePassword,
} = authController;

const authRouter = Router();

authRouter.post('/signup', validator(userSignUpSchema), catchAsync(signup));
authRouter.post('/login', validator(userLogInSchema), catchAsync(login));
authRouter.post('/logout', verifyToken, catchAsync(logout));
authRouter.post(
  '/reset-password',
  validator(resetPasswordSchema),
  catchAsync(resetPassword),
);
authRouter.post(
  '/update-password/:token',
  validator(updatePasswordSchema),
  catchAsync(updatePassword),
);
authRouter.post(
  '/change-password',
  verifyToken,
  validator(changePasswordSchema),
  catchAsync(changePassword),
);

module.exports = authRouter;
