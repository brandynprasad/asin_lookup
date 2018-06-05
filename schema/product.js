const Schema        = require('mongoose').Schema;


const productSchema = new Schema({
  asin      : { type: String },
  category  : { type: String },
  rank      : { type: String },
  dimensions: { type: String },
  body      : { type: String }
});


module.exports = productSchema;
