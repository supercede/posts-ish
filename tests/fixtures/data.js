const { v4: uuidv4 } = require('uuid');
const mockRequire = require('mock-require');
const { generateAuthToken } = require('../../src/helpers/auth');
const models = require('../../src/models');
const slugify = require('slugify');

const { User, Photo, Post } = models;

const user = {
  id: uuidv4(),
  name: 'John Thomas',
  email: 'me@mail.com',
  password: '1234567890',
};

const userTwo = {
  id: uuidv4(),
  name: 'Akan Michael',
  email: 'me@othermail.io',
  password: '123456789',
};

const userThree = {
  id: uuidv4(),
  name: 'Alan Shearer',
  email: 'alan@thebug.io',
  password: '123456789',
};

const userBuild = User.build(userTwo);
const userThreeBuild = User.build(userThree);

const userThreeToken = generateAuthToken(userThreeBuild);
const userTwoToken = generateAuthToken(userBuild);

const incompleteUser = {
  name: 'Dan James',
  password: '273939939',
};

const changePassword = {
  oldPassword: 'powermighty',
  newPassword: 'floridamans',
};

const postTwo = Post.build({
  id: uuidv4(),
  title: 'Lorem ipsum dolor sit amet.',
  body:
    'Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum, in vero? Aperiam beatae fugiat provident magni blanditiis laboriosam adipisci quam.',
  user_id: userBuild.id,
  date: Date.now(),
});

const id = uuidv4();
const postThree = Post.build({
  id,
  title: 'Lorem ipsum dolor sit amet.',
  body:
    'Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum, in vero? Aperiam beatae fugiat provident magni blanditiis laboriosam adipisci quam.',
  user_id: userThreeBuild.id,
  date: Date.now(),
  slug: `${slugify('Lorem ipsum dolor sit amet')}-${id}`,
});

const imageThree = Photo.build({
  title: uuidv4(),
  image_url: 'https://i.picsum.photos/id/237/200/300.jpg',
  user_id: userThreeBuild.id,
  post_id: postThree.id,
});

const setupDB = async () => {
  mockRequire('amqplib', 'mock-amqplib');

  await Photo.destroy({
    where: {},
  });
  await Post.destroy({
    where: {},
  });
  await User.destroy({
    where: {},
  });
  await userBuild.save();
  await userThreeBuild.save();
  await postTwo.save();
  await postThree.save();
  await imageThree.save();
};

const tearDownDB = async () => {
  mockRequire.stopAll();
  await Photo.destroy({
    where: {},
  });
  await Post.destroy({
    where: {},
  });
  await User.destroy({
    where: {},
  });
  models.sequelize.close();
};

module.exports = {
  user,
  userTwo,
  userThree,
  userThreeToken,
  userTwoToken,
  postThree,
  changePassword,
  tearDownDB,
  setupDB,
  incompleteUser,
};
