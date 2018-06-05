const Router = require('express').Router;
const router = new Router();


function findProductByAsin(req, res, next) {
  req.logger.info('Finding product with asin %s', req.params.asin);

  req.query.asin = req.params.asin;

  req.model('Product').findOne({
    asin: req.params.asin
  }, (err, product) => {
    if (err) { return next(err); }
    if (!product) {
      // Perform screenscrape lookup
    }

    // Render the view with product info here
    req.logger.verbose('Sending product to client');
    res.sendFound(product);
  });
}


router.get('/:asin([0-9a-f])', findProductByAsin);

module.exports = router;
