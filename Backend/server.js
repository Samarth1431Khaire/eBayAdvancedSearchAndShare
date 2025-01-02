const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const OAuthToken = require('./ebay_oauth_token');
const { MongoClient, ServerApiVersion } = require('mongodb')
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});
app.use(bodyParser.json());

const uri = "mongodb+srv://rgadia2000:mynewpassword@cluster0.xtutyy3.mongodb.net/?retryWrites=true&w=majority";
const APP_ID = 'RiddhamG-CSCI571A-PRD-472b2ae15-4dc4edc3';

const client_id = 'RiddhamG-CSCI571A-PRD-472b2ae15-4dc4edc3';
const client_secret = 'PRD-72b2ae1509dc-c457-4c34-bf06-41f2';
const oauthToken = new OAuthToken(client_id, client_secret);

// const GOOGLE_CSE_API_KEY = 'AIzaSyD-cPzAO31rvcg0pmhAfYEj5FKpWu0kvb0'; // replace with your actual API key
const GOOGLE_CSE_API_KEY = 'AIzaSyC1gbOgjR0Ln2ET6Twl7Awtj5lrkId0AtY';
// const GOOGLE_CSE_ID = '2088a7d00683e4899'; // replace with your custom search engine ID
const GOOGLE_CSE_ID = 'a191218403f5446b0';
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    db = await client.db('webtech3');
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

// Autocomplete route
app.get('/autocomplete', (req, res) => {
    const { zipCode } = req.query;
    console.log('zicode='+zipCode);
    // Make a request to the Geonames API for suggestions
    if (!zipCode) {
      return;
    }
    axios
      .get(
        `http://api.geonames.org/postalCodeSearchJSON?postalcode_startsWith=${zipCode}&maxRows=5&username=riddhamgadia&country=US`
      )
      .then((geonamesResponse) => {
        // Extract and send the suggestions as JSON response
        const suggestions = geonamesResponse.data.postalCodes.map((item) => item.postalCode);
        res.json(suggestions);
      })
      .catch((error) => {
        // Handle errors gracefully
        console.error('Error:', error.message);
        res.status(500).json({ error: 'An error occurred while fetching suggestions for zipcode.' });
      });
});


app.get('/search', (req, res) => {
  const { keyword, buyerpostalcode, maxdistance, freeshipping, localpickup, condition, categoryId } = req.query;
  let apiUrl = `https://svcs.ebay.com/services/search/FindingService/v1?paginationInput.entriesPerPage=50&OPERATION-NAME=findItemsAdvanced&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=${APP_ID}&RESPONSE-DATA-FORMAT=JSON`;
  if (keyword) {
    apiUrl += `&keywords=${encodeURIComponent(keyword)}`;
  }
  if (categoryId && categoryId !== '0') {
    apiUrl += `&categoryId=${encodeURIComponent(categoryId)}`;
  }
  if (buyerpostalcode && buyerpostalcode !== 'false') {
    apiUrl += `&buyerPostalCode=${encodeURIComponent(buyerpostalcode)}`;
  }
  let itemFilterIndex = 0;
  if (maxdistance) {
      apiUrl += `&itemFilter(${itemFilterIndex}).name=MaxDistance&itemFilter(${itemFilterIndex}).value=${encodeURIComponent(maxdistance)}`;
      itemFilterIndex++;
  }
  if (freeshipping && freeshipping !== 'false') {
    apiUrl += `&itemFilter(${itemFilterIndex}).name=FreeShippingOnly&itemFilter(${itemFilterIndex}).value=true`;
    itemFilterIndex++;
  }
  if (localpickup && localpickup !== 'false') {
    apiUrl += `&itemFilter(${itemFilterIndex}).name=LocalPickupOnly&itemFilter(${itemFilterIndex}).value=true`;
    itemFilterIndex++;
  }
  // console.log('condition='+condition);
  if (condition) { 
    let conditionsArray = condition.includes(',') ? condition.split(',') : [condition];
    conditionsArray = conditionsArray.filter(cond => cond.trim() !== 'Unspecified');

    // Assuming `apiUrl` and `itemFilterIndex` are already defined
    if (conditionsArray.length > 0) {
        apiUrl += `&itemFilter(${itemFilterIndex}).name=Condition`;
        conditionsArray.forEach((cond, idx) => {
            apiUrl += `&itemFilter(${itemFilterIndex}).value(${idx})=${encodeURIComponent(cond)}`;
        });
        itemFilterIndex++;
    }
}
  // Always add the HideDuplicateItems filter
  apiUrl += `&itemFilter(${itemFilterIndex}).name=HideDuplicateItems&itemFilter(${itemFilterIndex}).value=true`;
  itemFilterIndex++;
  apiUrl += `&outputSelector(0)=SellerInfo&outputSelector(1)=StoreInfo`;
  console.log(apiUrl);
  axios
  .get(apiUrl)
  .then((response) => {
    res.json(response.data);
  })
  .catch((error) => {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching eBay products in search route.' });
  });

});
app.get('/product', (req, res) => {
  oauthToken.getApplicationToken()
    .then((accessToken) => {
        const {itemid} = req.query;

        const url = `https://open.api.ebay.com/shopping?callname=GetSingleItem&responseencoding=JSON&appid=${APP_ID}&siteid=0&version=967&ItemID=${itemid}&IncludeSelector=Description,Details,ItemSpecifics`;

        const headers = {
            "X-EBAY-API-IAF-TOKEN": accessToken
        };

        axios.get(url, { headers: headers })
            .then(response => {
                res.json(response.data);
            })
            .catch(error => {
                console.error('Error:', error.message);
                res.status(500).send('Error fetching item from eBay.');
            });
    })
    .catch((error) => {
          console.error('Error:', error);
    });
});

app.get('/getSimilarItems', (req, res) => {
  const { itemId } = req.query;

  // Construct the full URL for eBay API
  const apiUrl = `https://svcs.ebay.com/MerchandisingService?OPERATION-NAME=getSimilarItems&SERVICE-NAME=MerchandisingService&SERVICE-VERSION=1.1.0&CONSUMER-ID=${APP_ID}&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&itemId=${itemId}&maxResults=20`;

  axios.get(apiUrl)
      .then(response => {
          res.json(response.data);
      })
      .catch(error => {
          console.error('Error fetching similar items from eBay:', error.message);
          res.status(500).json({ error: 'An error occurred while fetching similar items from eBay.' });
      });
});

app.get('/getProductImages', (req, res) => {
  const { productTitle } = req.query;

  const apiUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(productTitle)}&cx=${GOOGLE_CSE_ID}&imgSize=huge&num=8&searchType=image&key=${GOOGLE_CSE_API_KEY}`;
  axios.get(apiUrl)
      .then(response => {
          const images = response.data.items.map(item => ({
              link: item.link,
              snippet: item.snippet,
              thumbnail: item.image.thumbnailLink
          }));
          res.json(images);
      })
      .catch(error => {
          console.error('Error fetching images from Google Custom Search:', error.message);
          res.status(500).json({ error: 'An error occurred while fetching product images from Google Custom Search.' });
      });
});

// Route to add a document to the 'wishlist' collection using POST
app.get('/addDoc', async (req, res) => {
  const document = JSON.parse(req.query.document);
  // console.log(document);
  if (!document || Object.keys(document).length === 0) {
      return res.status(400).json({ error: 'Please provide document fields.' });
  }

  const collection = db.collection('wishlist');
  try {
      const result = await collection.insertOne(document);
      // console.log(result);
      if (result.acknowledged) {
          console.log('Document added successfully!');
          res.json({ success: true, message: 'Document added successfully!' });
      } else {
          throw new Error('Failed to insert document into MongoDB.');
      }
  } catch (err) {
      console.error('Error inserting document:', err);
      res.status(500).json({ error: 'Failed to insert document into MongoDB.' });
  }
});


app.get('/getAllDocs', async (req, res) => {
  const collection = db.collection('wishlist');

  try {
      console.log('connected to db');
      const docs = await collection.find({}).toArray();
      res.send(docs);
  } catch (err) {
      console.error('Error fetching documents:', err);
      res.status(500).json({ error: 'Failed to fetch documents from MongoDB.' });
  }
});

app.get('/checkDoc', async (req, res) => {
  const itemId = req.query.itemId; // Assuming you send itemId as a query parameter

  if (!itemId) {
      return res.status(400).json({ error: 'Please provide itemId.' });
  }

  const collection = db.collection('wishlist');
  
  try {
      const document = await collection.findOne({ itemId: itemId });
      
      if (document) {  
          console.log('Document with itemId', itemId, 'exists.');
          res.json({ success: true, message: 'Document exists!' });
      } else {
          console.log('No document found with itemId', itemId);
          res.status(404).json({ error: 'No document found with the provided itemId.' });
      }
  } catch (err) {
      console.error('Error checking document:', err);
      res.status(500).json({ error: 'Failed to check document in MongoDB.' });
  }
});

app.get('/removeDoc', async (req, res) => {
  const itemId = req.query.itemId; // Assuming you send itemId in the request body

  if (!itemId) {
      return res.status(400).json({ error: 'Please provide itemId.' });
  }

  const collection = db.collection('wishlist');
  
  try {
      const result = await collection.deleteOne({ itemId: itemId });
      
      if (result.deletedCount > 0) {  
          console.log('Document with itemId', itemId, 'was removed.');
          res.json({ success: true, message: 'Document removed successfully!' });
      } else {
          console.log('No document found with itemId', itemId);
          res.status(404).json({ error: 'No document found with the provided itemId.' });
      }
  } catch (err) {
      console.error('Error removing document:', err);
      res.status(500).json({ error: 'Failed to remove document from MongoDB.' });
  }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });