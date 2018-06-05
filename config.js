const milieu = require('milieu');


const config = milieu('asinlookup', {
  server: {
    url            : 'http://localhost:8000',
    maxResultsLimit: 1000
  },
  mongo: {
    url: 'mongodb://localhost/asin-lookup'
  },
  logger: {
    console: {
      level                          : 'silly',
      timestamp                      : true,
      handleExceptions               : true,
      humanReadableUnhandledException: true,
      colorize                       : true
    }
  }
});


module.exports = config;
