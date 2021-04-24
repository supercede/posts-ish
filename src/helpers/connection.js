const deleteImage = require('./deleteImage');
const Email = require('./email');
const RabbitMQ = require('./rabbitmq');
const subscriber = require('./rabbitmq');

module.exports = {
  async rabbitmq() {
    RabbitMQ.init();
  },
  async subscribe() {
    await subscriber.init();
    // Delete Image
    subscriber.consume(
      'SEND_WELCOME_EMAIL',
      async msg => {
        const userData = JSON.parse(msg.content.toString());
        await new Email(userData).sendRegistrationMail();
        subscriber.acknowledgeMessage(msg);
      },
      3,
    );

    subscriber.consume(
      'SEND_PASSWORD_RESET_EMAIL',
      async msg => {
        const { user, resetURL } = JSON.parse(msg.content.toString());
        await new Email(user, { url: resetURL }).sendPasswordResetMail();
        subscriber.acknowledgeMessage(msg);
      },
      3,
    );

    subscriber.consume(
      'DELETE_IMAGE_URL',
      async msg => {
        const url = msg.content.toString();
        await deleteImage(url);
        subscriber.acknowledgeMessage(msg);
      },
      3,
    );
  },
};
