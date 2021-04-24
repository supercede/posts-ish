const appRoot = require('app-root-path');
const winston = require('winston');

// define the custom settings for each transport (file, console)
const { format, createLogger } = winston;
const options = {
  file: {
    level: 'error',
    filename: `${appRoot}/logs/app.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
    format: format.combine(
      format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
      format.align(),
      format.printf(
        info => `${info.level}: ${[info.timestamp]}: ${info.message}`,
      ),
      // Convert logs to a json format
      format.json(),
    ),
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
    format: format.combine(
      format.colorize(),
      format.prettyPrint(),
      format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
      // format.align(),
      format.printf(
        info => `${info.level}: ${[info.timestamp]}: ${info.message}`,
      ),
    ),
  },
};

// instantiate a new Winston Logger with the settings defined above
const logger = createLogger({
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console),
  ],
  exitOnError: false, // do not exit on handled exceptions
});

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write: (message, encoding) => {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.info(message);
  },
};

module.exports = logger;
