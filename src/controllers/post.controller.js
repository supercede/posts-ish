const { Op } = require('sequelize');
const models = require('../models');
const { NotFoundError } = require('../helpers/errors');
const producer = require('../helpers/rabbitmq');
const pagination = require('../helpers/pagination');

const { User, Post, Photo } = models;

module.exports = {
  /**
   * @function createPost
   * @description controller to create post
   *
   * @param {Object} request - the request object
   * @param {Object} response - the response object
   *
   * @returns {Object} response object
   */
  createPost: async (request, response) => {
    const { title, body } = request.body;

    const post = await request.user.createPost({
      title,
      body,
      date: Date.now(),
    });

    if (request.files) {
      Promise.all(
        request.files.map(async file => {
          const { path } = file;
          request.body.imageURL = path;
          const { imageURL } = request.body;

          await post.createPhoto({
            image_url: imageURL,
            user_id: request.user.id,
          });
        }),
      ).catch(err => {
        throw err;
      });
    }

    return response.status(201).json({
      status: 'success',
      message: 'Post created',
    });
  },

  /**
   * @function getPosts
   * @description controller for getting all posts
   *
   *
   * @param {Object} request - express request object
   * @param {Object} response - express response object
   *
   * @returns {Object} - express response object
   */
  getPosts: async (request, response) => {
    const { page = 1, limit = 20, sort } = request.query;

    const query = { include: [{ model: Photo }, { model: User }] };

    const queryOptions = {
      sort,
      limit,
      page,
    };

    const posts = await pagination(Post, query, queryOptions);

    return response.status(201).json({
      status: 'success',
      message: 'Posts fetched successfully',
      count: posts.count,
      page: +page,
      limit: +limit,
      results: posts.rows,
    });
  },

  /**
   * @function getUserPost
   * @description controller for getting a particular user's posts
   *
   *
   * @param {Object} request - express request object
   * @param {Object} response - express response object
   *
   * @returns {Object} - express response object
   */
  getUserPosts: async (request, response) => {
    const { id } = request.params;
    const user = await User.findByPk(id);

    if (!user) {
      throw new NotFoundError('User not found');
    }
    const { page = 1, limit = 20, sort } = request.query;

    const query = {
      where: { user_id: user.id },
      include: [{ model: Photo }, { model: User }],
    };

    const queryOptions = {
      sort,
      limit,
      page,
    };

    const posts = await pagination(Post, query, queryOptions);

    return response.status(200).json({
      status: 'success',
      message: 'Posts fetched successfully',
      count: posts.count,
      page: +page,
      limit: +limit,
      results: posts.rows,
    });
  },

  /**
   * @function getSinglePost
   * @description controller for getting a post by its slug
   *
   *
   * @param {Object} request - express request object
   * @param {Object} response - express response object
   *
   * @returns {Object} - express response object
   */
  getSinglePost: async (request, response) => {
    const { slug } = request.params;
    const post = await Post.findOne({
      where: {
        slug,
      },
      include: [{ model: Photo }, { model: User }],
    });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    return response.status(200).json({
      status: 'success',
      message: 'Posts fetched successfully',
      result: post,
    });
  },

  /**
   * @function updatePost
   * @description controller for updating posts by slug
   *
   *
   * @param {Object} request - express request object
   * @param {Object} response - express response object
   *
   * @returns {Object} - express response object
   */
  updatePost: async (request, response) => {
    const { slug } = request.params;
    const { title, body } = request.body;

    const post = await Post.findOne({
      where: {
        user_id: request.user.id,
        slug,
      },
    });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    post.body = body || post.body;
    post.title = title || post.title;

    await post.save();

    if (request.files) {
      Promise.all(
        request.files.map(async file => {
          const { path } = file;
          request.body.imageURL = path;
          const { imageURL } = request.body;

          await post.createPhoto({
            image_url: imageURL,
            user_id: request.user.id,
          });
        }),
      ).catch(err => {
        throw err;
      });
    }

    return response.status(200).json({
      status: 'success',
      message: 'Post updated successfully',
    });
  },

  /**
   * @function deletePost
   * @description controller for deleting posts by slug
   *
   *
   * @param {Object} request - express request object
   * @param {Object} response - express response object
   *
   * @returns {Object} - express response object
   */
  deletePost: async (request, response) => {
    const { slug } = request.params;

    const post = await Post.findOne({
      where: {
        user_id: request.user.id,
        slug,
      },
    });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    const photos = await post.getPhotos();
    const imageURLs = await photos.map(photo => photo.image_url);
    for (const url of imageURLs) {
      producer.queue('DELETE_IMAGE_URL', url);
    }

    await post.destroy();

    return response.status(204).json({});
  },
};
