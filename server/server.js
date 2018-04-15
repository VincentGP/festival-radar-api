// Sæt vores globale variabler til at starte
require('./config/config');
require('./db/db');

// Hvis applikationen er lokal kører vi på port 7777
const port = process.env.PORT || 7777;

// Eksterne imports
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Sæt Expess i gang
const app = express();

// Middleware til at parse requests
app.use(bodyParser.json());

// Hvis vi arbejder lokalt så slå CORS til på alt
if (port === 7777) {
  app.use(cors());
}

// Her importerer vi alle vores routes
require('./routes/festivals')(app);
require('./routes/articles')(app);
require('./routes/artists')(app);
require('./routes/users')(app);

// Start server
app.listen(port, () => {
  console.log('Startede server 😛');
});