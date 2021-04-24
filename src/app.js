const express = require('express');
const { config } = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const winston = require('./config/logger');
const routes = require('./routes');

config();

const app = express();

const logPath = path.join(__dirname, '../logs');

app.use(cors('*'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('combined', { stream: winston.stream }));

app.use('/api', routes);

app.get('/', (_, response) => {
  response.status(200).json({
    status: 'success',
    error: 'Welcome to posts-ish',
  });
});

app.get('/logs', (_, response) => {
  response.sendFile(`${logPath}/app.log`);
});

app.all('*', (request, response) => {
  winston.error(
    `404 - Page not found - ${request.originalUrl} - ${request.method} - ${request.ip}`,
  );

  response.status(404).json({
    status: 'error',
    error: 'resource not found',
  });
});

app.use(errorHandler);

module.exports = app;
