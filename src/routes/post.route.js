const { Router } = require('express');
const postController = require('../controllers/post.controller');
const catchAsync = require('../helpers/catchAsync');
const postValidator = require('../validations/post.validation');
const validator = require('../middleware/validator');
const upload = require('../helpers/uploadImage');
const { verifyToken } = require('../middleware/auth');

const postRouter = Router();
const {
  createPost,
  getPosts,
  getSinglePost,
  updatePost,
  deletePost,
  getUserPosts,
} = postController;
const { createPostSchema } = postValidator;

postRouter.use(verifyToken);

postRouter
  .route('/')
  .post(
    upload.array('photos', 4),
    validator(createPostSchema),
    catchAsync(createPost),
  )
  .get(catchAsync(getPosts));

postRouter
  .route('/:slug')
  .get(catchAsync(getSinglePost))
  .patch(upload.array('photos', 4), catchAsync(updatePost))
  .delete(catchAsync(deletePost));

postRouter.get('/user/:id', catchAsync(getUserPosts));

module.exports = postRouter;
