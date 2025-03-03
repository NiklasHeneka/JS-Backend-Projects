require('dotenv').config();
let bodyParser = require('body-parser')
const dns = require('node:dns');
const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({extended: false}))

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

let urls = {};

app.get("/api/shorturl/:short_url", (req, res) => {
  const short_url = req.params.short_url;
  const url = urls[parseInt(short_url)];
  if (url === undefined) {
    res.json({ error: "No short URL found for the given input" });
  } else {
    res.redirect(url);
  }
});

app.post("/api/shorturl", (req, res) => {
  const url = req.body.url;
  let mainURL = url;
  if (mainURL.includes("://")) {
    mainURL = url.split("://")[1];
  }
  if (mainURL.includes("/")) {
    mainURL = mainURL.split("/")[0];
  }
  dns.lookup(mainURL, {}, (err, address, family) => {
    if (err) res.json({ error: 'invalid url' });
    else {
      const short_url = Object.keys(urls).length + 1;
      urls[short_url] = url;
      res.json({ original_url: url, short_url });
    }
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
