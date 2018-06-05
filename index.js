const config = require('./config');
const logger = require('./logger');
const AsinLookup = require('./lib/asin-lookup');


exports = module.exports = new AsinLookup(config, logger);
exports.AsinLookup = AsinLookup;
