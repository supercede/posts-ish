const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const pug = require('pug');
const { htmlToText } = require('html-to-text');
const path = require('path');
const logger = require('../config/logger');
require('dotenv').config();

const {
  GOOGLE_REFRESH_TOKEN,
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
  EMAIL_ADDRESS,
} = process.env;

class Email {
  constructor(user, options = {}) {
    this.to = user.email;
    this.email = EMAIL_ADDRESS;
    this.name = user.name;
    this.reset_url = options.url;
  }

  // create transporter
  async createNewTransport() {
    // gmail for production
    if (process.env.NODE_ENV === 'production') {
      const oAuth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URI,
      );
      oAuth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
      const accessToken = await oAuth2Client.getAccessToken();
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: this.email,
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          refreshToken: GOOGLE_REFRESH_TOKEN,
          accessToken,
        },
      });
    }
    // Mailtrap used for development environment
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    try {
      // render HTML
      const mailPath = path.join(__dirname, '../views/emails');
      const html = pug.renderFile(`${mailPath}/${template}`, {
        name: this.name,
        url: this.reset_url,
      });
      // Define email options
      const mailOptions = {
        from: 'Posts-ish <hello@posts-ish.co>',
        to: this.to,
        subject,
        text: htmlToText(html),
        html,
      };

      // Create transport and send mail
      const transporter = await this.createNewTransport();
      await transporter.sendMail(mailOptions);
    } catch (err) {
      logger.error('mail sending error: ', err);
    }
  }

  async sendRegistrationMail() {
    await this.send('welcome.pug', 'Hello from Posts-ish');
  }

  async sendPasswordResetMail() {
    await this.send(
      'password-reset.pug',
      'Password Reset (Valid for 30 minutes)',
    );
  }
}

module.exports = Email;
