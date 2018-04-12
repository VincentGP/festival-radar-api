// Eksterne imports
const _ = require('lodash');
const { ObjectID } = require('mongodb');

// Interne imports
const { Festival } = require('../models/Festival');

module.exports = (app) => {
  // GET: Hent alle festivaler
  app.get('/festivals', (req, res) => {
    Festival.find()
      .then((festivals) => {
        res.status(200).send(festivals);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  });
  // POST: Opret festival
  app.post('/festivals', (req, res) => {
    // Vælg de værdier som vi skal bruge fra request body
    let body = _.pick(req.body, [
      'location',
      'artists',
      'startDate',
      'endDate',
      'name',
      'price',
      'availability',
      'poster',
      'description',
      'video',
      'link',
      'popularity'
    ]);
    // Lav ny festival instance og sæt værdier til hvad der er blevet sendt med
    let festival = new Festival(body);
    // Gem festival i database
    festival.save()
      .then((festival) => {
        res.status(201).send(festival);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  });
};