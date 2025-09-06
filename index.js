const express = require('express');
const dns = require('dns');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let urlDatabase = {};
let counter = 1;

// POST endpoint
app.post('/api/shorturl', (req, res) => {
  let originalUrl = req.body.url;

  try {
    let urlObj = new URL(originalUrl);

    // Only accept http or https
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return res.json({ error: 'invalid url' });
    }

    // Verify hostname with dns.lookup
    dns.lookup(urlObj.hostname, (err) => {
      if (err) return res.json({ error: 'invalid url' });

      // Save mapping
      let shortUrl = counter++;
      urlDatabase[shortUrl] = originalUrl;

      res.json({
        original_url: originalUrl,
        short_url: shortUrl,
      });
    });
  } catch (err) {
    res.json({ error: 'invalid url' });
  }
});

// GET endpoint
app.get('/api/shorturl/:short_url', (req, res) => {
  let shortUrl = req.params.short_url;
  let originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'invalid url' });
  }
});

app.listen(3000, () => {
  console.log('App is listening on port 3000');
});
