// Sæt vores globale variabler til at starte
require('./config/config');
require('./db/db');

const port = process.env.PORT || 7777;

const express = require('express');
const bodyParser = require('body-parser');

// Sæt Expess i gang
const app = express();

app.use(bodyParser.json());

// Her importerer vi alle vores routes
require('./routes/festivals')(app);

// Start server
app.listen(port, () => {
  console.log('Startede server 😛');
});