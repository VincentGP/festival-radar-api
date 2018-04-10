// Sæt vores globale variabler til at starte
require('./config/config');
const port = process.env.PORT || 7777;

const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('./db/db');

const { Festival } = require('./models/Festival');

// Sæt Expess i gang
const app = express();

app.use(bodyParser.json());

// Hent alle festivaler
app.get('/festivals', (req, res) => {
  Festival.find()
    .then((festivals) => {
      res.status(200).send(festivals);
    })
    .catch((err) => {
      res.status(400).send(err);      
    });
});

// POST/ Opret festivaler
app.post('/festivals', (req, res) => {
  let festival = new Festival();
  festival.name = req.body.name;
  festival.availability = req.body.availability;
  festival.save()
    .then((festival) => {
      res.status(201).send(festival);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Start server
app.listen(port, () => {
  console.log(`Startede server 😛`);
});