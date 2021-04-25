/* eslint-disable arrow-body-style */
const request = require('supertest');
const app = require('../../src/app');
const models = require('../../src/models');
const rabbitmq = require('../../src/helpers/rabbitmq');
const {
  userTwo,
  setupDB,
  postThree,
  tearDownDB,
  userTwoToken,
  userThreeToken,
} = require('../fixtures/data');

const { Photo } = models;

jest.mock('../../src/helpers/rabbitmq', () => ({
  init: jest.fn(),
  queue: jest.fn(),
}));

rabbitmq.init();

beforeAll(async () => {
  await setupDB();
});

afterAll(async () => {
  await tearDownDB();
});

describe('posts controller', () => {
  describe('create post', () => {
    test('should create a post', async () => {
      const response = await request(app)
        .post('/api/posts')
        .send({
          title: "Adam's apple",
          body:
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. At, quo.',
        })
        .set('Authorization', `Bearer ${userTwoToken}`);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Post created');
    });
    test('should not create post for unaunthenticated user', async () => {
      const response = await request(app).post('/api/posts').send({
        title: "Adam's apple",
        body:
          'Lorem ipsum dolor sit amet consectetur adipisicing elit. At, quo.',
      });

      expect(response.status).toBe(412);
      expect(response.body.status).toBe('error');
    });
    test('should not upload post with incomplete data', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${userTwoToken}`)
        .send({
          title: "Adam's apple",
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.error.message).toBe('validation error');
    });
  });

  describe('get posts', () => {
    test('should get all posts', async () => {
      const response = await request(app)
        .get('/api/posts')
        .set('Authorization', `Bearer ${userTwoToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body).toHaveProperty('results');
    });

    test('should paginate posts', async () => {
      const response = await request(app)
        .get('/api/posts?limit=2')
        .set('Authorization', `Bearer ${userTwoToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('results');
      expect(response.body.results.length).toBe(2);
    });

    test('should not fetch posts if user is not logged in', async () => {
      const response = await request(app).get('/api/posts');

      expect(response.status).toBe(412);
      expect(response.body.status).toBe('error');
    });

    test("should fetch a user's posts", async () => {
      const response = await request(app)
        .get(`/api/posts/user/${userTwo.id}`)
        .set('Authorization', `Bearer ${userTwoToken}`);

      const userIds = response.body.results.map(post => post.user_id);
      const isUserId = userIds.every(id => id === userTwo.id);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('results');
      expect(isUserId).toBe(true);
    });

    test('should get a single post by slug', async () => {
      const response = await request(app)
        .get(`/api/posts/${postThree.slug}`)
        .set('Authorization', `Bearer ${userTwoToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('result');
    });

    test('should throw error if post is not found', async () => {
      const response = await request(app)
        .get('/api/posts/invalid')
        .set('Authorization', `Bearer ${userTwoToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('update post', () => {
    test('should update a post', async () => {
      const response = await request(app)
        .patch(`/api/posts/${postThree.slug}`)
        .set('Authorization', `Bearer ${userThreeToken}`)
        .send({
          title: "Adam's apple",
          body:
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. At, quo.',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Post updated successfully');
    });

    test('should not allow user update post they do not own', async () => {
      const response = await request(app)
        .patch(`/api/posts/${postThree.slug}`)
        .set('Authorization', `Bearer ${userTwoToken}`)
        .send({
          title: "Adam's apple",
          body:
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. At, quo.',
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('delete post', () => {
    test('should not allow user delete post they do not own', async () => {
      const response = await request(app)
        .delete(`/api/posts/${postThree.slug}`)
        .set('Authorization', `Bearer ${userTwoToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    test('should delete a post', async () => {
      const response = await request(app)
        .delete(`/api/posts/${postThree.slug}`)
        .set('Authorization', `Bearer ${userThreeToken}`);

      expect(response.status).toBe(204);
      expect(rabbitmq.queue).toHaveBeenCalled();
    });

    test('should delete image alongside post', async () => {
      const image = await Photo.findOne({
        where: {
          post_id: postThree.id,
        },
      });

      expect(image).toBe(null);
    });
  });
});
