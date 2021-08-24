/**
 * This is a simple node.js application to update Price List Records.
 * This will ONLY update the "Price" values from a CSV file.
 */
require("dotenv").config();

const express = require("express");
const fs = require("fs-extra");
const csvParse = require("csv-parse");
const app = express();

const BigCommerce = require("node-bigcommerce");

const CSVFILE = "your_file.csv";

// Create the BigCommerce object
const bigC = new BigCommerce({
  logLevel: "info",
  clientId: process.env.BC_CLIENT_ID,
  secret: process.env.BC_CLIENT_SECRET,
  accessToken: process.env.BC_ACCESS_TOKEN,
  storeHash: process.env.BC_STORE_HASH,
  responseType: "json",
  headers: { "Accept-Encoding": "*" },
  apiVersion: "v3"
});

app.use(express.json());

app.get("/importrecords", async (req, res) => {
  res.send("Job started");

  const PriceListFile = fs.readFileSync(CSVFILE);

  csvParse(PriceListFile, { columns: true, trim: true }, async (err, rows) => {
    if(err) console.log("Failed to parse CSV");

    let priceListBatch = {};

    rows.forEach(record => {
      let pushObj = {
        "price_list_id": parseInt(record['Price List ID']),
        "currency": record['Currency'],
        "price": parseFloat(record['Price']),
        "sku": record['SKU Code']
      };

      if(priceListBatch.hasOwnProperty(`${pushObj['price_list_id']}`)) { // If the batch object already has a key with the price list ID
        priceListBatch[`${pushObj['price_list_id']}`].push(pushObj); // push the data to the price list ID array
      } else { // if not
        priceListBatch[`${pushObj['price_list_id']}`] = []; // create an empty array in the object first
        priceListBatch[`${pushObj['price_list_id']}`].push(pushObj); // then push the data (avoiding undefined errors)
      }
    });

    const batchSize = 1000;

    for(let key in priceListBatch) {
      console.log(`Updating Price List ID ${key}`);

      const batchSplit = [];

      for(let i = 0, len = priceListBatch[`${key}`].length; i < len; i+= batchSize) {
        batchSplit.push(priceListBatch[`${key}`].slice(i, i+batchSize));
      }

      // For each split array in the batch, make a request to update the price list
      for(let i = 0, len = batchSplit.length; i < len; i++) {
        await bigC.put(`/pricelists/${key}/records`, batchSplit[i])
        .then(() => {
          console.log(`Successful batch request ${i+1} of ${len}`);
        })
        .catch(err => {
          console.log(err);
        });
      }
    }
  });
});

var listener = app.listen(process.env.PORT || 8080, function() {
  console.log(`Listening on port ${listener.address().port}`);
});
