const async       = require('async');
const Database    = require('./database');
const Server      = require('./server');

class AsinLookup {

  constructor(config, logger) {
    this.config    = config;
    this.logger    = logger.child({ context: 'AsinLookup' });
    this.isRunning = false;
    this.database  = new Database(config, this.logger);
    this.server    = new Server(config, this.logger, this.database);
  }

  start(cb) {
    if (this.isRunning) {
      throw new Error('Cannot start AsinLookup because it is already running');
    }
    this.isRunning = true;

    this.logger.verbose('Starting AsinLookup');

    async.parallel([
      (cb) => this.database.connect(cb),
      (cb) => this.server.listen(cb)
    ], (err) => {
      if (err) { return cb(err); }

      this.logger.verbose('Registering AsinLookup as a service with Consul');

      this.logger.verbose('AsinLookup ready and awaiting requests');
      cb(null, { url: this.config.server.url });
    });
  }

  stop(cb) {
    if (!this.isRunning) {
      throw new Error('Cannot stop AsinLookup because it is already stopping');
    }
    this.isRunning = false;

    this.logger.verbose('Stopping AsinLookup');
    async.parallel([
      (cb) => { this.database.disconnect(cb); },
      (cb) => { this.server.close(cb); }
    ], (err) => {
      if (err) { return cb(err); }
      return cb(null);
    });
  }
}


module.exports = AsinLookup;
