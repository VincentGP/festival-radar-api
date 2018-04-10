// Sæt vores globale variabler til at starte
require('./config/config');
const port = process.env.PORT || 7777;

const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('./db/db');

// Sæt Expess i gang
const app = express();

app.use(bodyParser.json());

// Hent alle festivaler
app.get('/festivals', (req, res) => {
  res.status(200).send('Her er en masse festivaler');
});

app.post('/festivals', (req, res) => {
  res.status(200).send(req.body.navn);
});

// Start server
app.listen(port, () => {
  console.log(`Startede server 😛`);
});