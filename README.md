# ASIN Lookup

### Things you'll need to install:
1. Node.js. This project was developed and tested on Node v9.3.0.
2. Yarn or NPM Package managers to install node module project dependencies
3. MongoDB. This project was developed using MongoDB v3.2.6 installed via Homebrew

### How to run the app:
1. `cd ./node_asin_lookup`
2. run `yarn` or `npm install`
3. run `yarn start` or `npm start`
4. Go to `localhost:8000` in your browser and supply a valid ASIN from Amazon.com to search with!

### How it works:
When you provide an ASIN for the very first time, ASIN Lookup will launch a headless browser and navigate to Amazon.com, and attempt to scrape the category, best seller's rank and product dimensions for the pertinent ASIN. That product information then gets saved to the Product collection in mongodb for easy access, and no web scraping the next time you search for that ASIN!

### Caveats:
Amazon.com likes to use different HTML templates between their product listings... it makes reliably screen scraping the data we want a little bit trickier! ASIN Lookup tries to deal with this the best it can by considering various HTML templates that Amazon.com uses.

Thanks for checking out my project! For things to come... I hope to improve upon the view layer soon :)
