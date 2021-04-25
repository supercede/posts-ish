const request = require('supertest');
const app = require('../../src/app');
const models = require('../../src/models');
const rabbitmq = require('../../src/helpers/rabbitmq');
const {
  user,
  userTwo,
  userThree,
  incompleteUser,
  changePassword,
  setupDB,
  tearDownDB,
  userTwoToken,
  userThreeToken,
} = require('../fixtures/data');

const { User } = models;

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

describe('User Authentication', () => {
  describe('signup route', () => {
    test('should sign a user up', async () => {
      const response = await request(app).post('/api/auth/signup').send(user);

      const newUser = await User.findByPk(response.body.result.user.id);
      expect(newUser).not.toBeNull();
      expect(rabbitmq.queue).toHaveBeenCalled();
      expect(response.status).toBe(201);
      expect(response.body.result).toHaveProperty('token');
    });

    test('Should not accept duplicate user', async () => {
      const response = await request(app).post('/api/auth/signup').send(user);

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
    });

    test('Should not accept incomplete user', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send(incompleteUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message', 'validation error');
    });
  });

  describe('sign in route', () => {
    test('Should log a user in with email and password', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: user.email,
        password: user.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.result).toHaveProperty('token');
      expect(response.body.result).toHaveProperty('user');
    });

    test('Should not log a user in with incorrect credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: 'somepasss1234' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty(
        'message',
        'email or password is incorrect',
      );
    });
  });

  describe('change password', () => {
    test('should not change user password if unauthenticated', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .send(changePassword);

      expect(response.status).toBe(412);
      expect(response.body).toHaveProperty('error');
    });

    test('should change user password if right password is provided and user is authenticated', async () => {
      changePassword.oldPassword = userTwo.password;
      const response = await request(app)
        .post('/api/auth/change-password')
        .send(changePassword)
        .set('Authorization', `Bearer ${userTwoToken}`);

      expect(response.body.status).toBe('success');
      expect(response.body).toHaveProperty('result');
    });

    test('should not authenticate user in if old token is used after password change', async () => {
      changePassword.oldPassword = userTwo.password;
      const response = await request(app)
        .post('/api/auth/change-password')
        .send(changePassword)
        .set('Authorization', `Bearer ${userTwoToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('logout', () => {
    test('should logout user', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${userThreeToken}`);

      expect(response.status).toBe(200);
    });

    test('should not perform authenticated request with token after logout', async () => {
      changePassword.oldPassword = userThree.password;
      const response = await request(app)
        .post('/api/auth/change-password')
        .send(changePassword)
        .set('Authorization', `Bearer ${userThreeToken}`);

      expect(response.body.status).toBe('error');
    });
  });

  describe('reset/update password', () => {
    let validToken;
    test('should send mail for password reset', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ email: userTwo.email });

      validToken = response.body.result;

      const resetUser = await User.findOne({ where: { email: userTwo.email } });

      expect(response.status).toBe(200);
      expect(rabbitmq.queue).toHaveBeenCalled();
      expect(response.body).toHaveProperty(
        'message',
        'Password reset email sent successfully',
      );
      expect(resetUser.password_reset_token).toBeTruthy();
      expect(resetUser.password_token_expires_at).toBeTruthy();
    });

    test('should not send mail for password reset to non-existing mail', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ email: 'invalid@mail.com' });

      expect(response.status).toBe(404);
      expect(response.body.error).toHaveProperty('message', 'Email not found');
    });

    test('should throw validation error for password reset if mail is not provided', async () => {
      const response = await request(app).post('/api/auth/reset-password');

      expect(response.status).toBe(400);
      expect(response.body.error).toHaveProperty('message', 'validation error');
    });

    test('should reset password if reset token is valid', async () => {
      const response = await request(app)
        .post(`/api/auth/update-password/${validToken}`)
        .send({
          password: 'newpass123',
        });

      console.log(validToken);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.result).toHaveProperty('token');
    });

    test('should not reset password if reset token is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/update-password/invalid')
        .send({
          password: 'newpass123',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body).toHaveProperty('error');
    });

    test('should throw validation error if required fields are not provided', async () => {
      const response = await request(app)
        .post('/api/auth/update-password/invalid')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.error.errors).toHaveProperty('password');
    });
  });
});
