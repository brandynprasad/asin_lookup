const Router = require('express').Router;
const router = new Router();

const puppeteer = require('puppeteer');

function findProductByAsin(req, res, next) {
  req.logger.info('Finding product with asin %s', req.params.asin);

  req.query.asin = req.params.asin;

  req.model('Product').findOne({
    asin: req.params.asin
  }, (err, product) => {
    if (err) { return next(err); }

    if (product) {
      req.logger.verbose(`Sending product ${product._id} to client`);
      res.render('product', { product });
    }
    else {
      (async () => {
        const browser = await puppeteer.launch();
        const page    = await browser.newPage();

        await page.goto('https://www.amazon.com');
        await page.goto(`https://www.amazon.com/dp/${req.params.asin}`)

        const result = await page.evaluate(() => {
          // GET CATEGORY
          let category = [...document.querySelectorAll('#nav-subnav')]
            .map(node => node.getAttribute('data-category'))[0].replace(/-/g, ' ');

          let dimensions = '';
          let rank       = '';

          document.querySelectorAll('*').forEach((node) => {

            // GET DIMENSIONS
            if (node.textContent.includes('Item Dimensions') && dimensions == '') {

              dimensions = node.textContent.substring(
                node.textContent.lastIndexOf('L x W x H'),
                node.textContent.lastIndexOf(' inches')
              );
              dimensions = `${dimensions.slice(9).replace(/\s/g, '')}`
            }

            if (node.textContent.includes('Product Dimensions') && dimensions == '' ||
              node.textContent.includes('Product Dimensions') && dimensions.length > 30) {

                dimensions = node.textContent.substring(
                  node.textContent.lastIndexOf('Product Dimensions'),
                  node.textContent.lastIndexOf(' inches')
                );

                dimensions = `${dimensions.slice(18).replace(/\s/g, '')}`
            }

            if (node.textContent.includes('Package Dimensions') && dimensions == '') {
              dimensions = node.textContent.substring(
                node.textContent.lastIndexOf('Package Dimensions'),
                node.textContent.lastIndexOf(' inches')
              );

              dimensions = `${dimensions.slice(18).replace(/\s/g, '')}`
            }

            // GET RANK
            if (node.textContent.includes('Best Sellers Rank') && rank == '') {

              try {
                rank = node.textContent.substring(
                  node.textContent.lastIndexOf('Best Sellers Rank'),
                  node.textContent.lastIndexOf('Warranty')
                );

                rank = rank.substring(
                  rank.lastIndexOf('Best Sellers Rank'),
                  rank.indexOf('in')
                );

                rank = rank.match(/\d|[0-9]+/g).map(Number).toString().replace(/,/g, '');
              } catch(err) {
                console.log(err);

                rank = node.textContent.substring(
                  node.textContent.lastIndexOf('Best Sellers Rank'),
                  node.textContent.lastIndexOf('Shipping Weight')
                );

                rank = rank.substring(
                  rank.lastIndexOf('Best Sellers Rank'),
                  rank.indexOf('in')
                );

                rank = rank.match(/\d|[0-9]+/g).map(Number).toString().replace(/,/g, '');
              }
            }
          });

          // Final formatting of dimensions
          if (dimensions !==  '') {
            const rg = new RegExp("\\" + 'x', "g");
            dimensions = dimensions.replace(rg, " x ");

            if (dimensions[0] === ":") {
              dimensions = dimensions.substring(1);
            }
          }

          return { category, dimensions, rank };
        });

        await req.model('Product').create({
          asin      : req.params.asin,
          category  : result.category,
          dimensions: result.dimensions,
          rank      : result.rank,
        }, (err, product) => {
          if (err) {
            req.logger.error(err);
            return res.status(404).end();
          }

          browser.close();

          req.logger.verbose(`Product ${product._id} created. Sending product to client`);
          res.render('product', { product });
        });
      })();
    }
  });
}

function queryProducts(req, res, next) {
  req.logger.info('Querying products', req.query);
  req.model('Product').countAndFind(req.query)
    .exec((err, products, productCount) => {
      if (err) { return next(err); }

      req.logger.verbose('Sending products to client');
      res.render('products', { products, productCount });
    });
}

function search(req, res, next) {
  res.render('search');
}


router.get('/product/:asin', findProductByAsin);
router.get('/products',      queryProducts);

router.get('/search', search);
router.get('/',       search);

module.exports = router;
