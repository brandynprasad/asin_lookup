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
      // TODO: Send the product from db
    }
    else {
      (async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto('https://www.amazon.com');
        await page.goto(`https://www.amazon.com/dp/${req.params.asin}`)

        const result = await page.evaluate(() => {
          // GET CATEGORY
          let category = [...document.querySelectorAll('#nav-subnav')]
            .map(node => node.getAttribute('data-category'))[0].replace('-', ' ');

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

            if (node.textContent.includes('Product Dimensions') && dimensions == '') {
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

              rank = node.textContent.substring(
                node.textContent.lastIndexOf('Best Sellers Rank'),
                node.textContent.lastIndexOf('Warranty')
              );

              rank = rank.substring(
                rank.lastIndexOf('Best Sellers Rank'),
                rank.indexOf('in')
              );

              rank = rank.match(/\d|[0-9]+/g).map(Number).toString().replace(/,/g, '')
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

        await console.log(result);

        await browser.close();

        await res.send(result)
      })();
    }

    // TODO: Render the view with product info here
    // req.logger.verbose('Sending product to client');
    // res.send(product);
  });
}


router.get('/product/:asin', findProductByAsin);

module.exports = router;
