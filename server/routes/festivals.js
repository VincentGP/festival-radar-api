// Eksterne imports
const _ = require('lodash');
const { ObjectID } = require('mongodb');

// Interne imports
const { Festival } = require('../models/Festival');
const body = [];

Festival.schema.eachPath((path) => {
  if (path != '_id' && path != '__v') {
    body.push(path);
  }
});

console.log(body);



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
  // GET: Hent specifik festival baseret på ID
  app.get('/festivals/:id', (req, res) => {
    // Gem id fra URL
    let id = req.params.id;
    // Hvis id ikke er et valid ObjectID
    if (!ObjectID.isValid(id)) {
      return res.status(404).send('Invalid ObjectID');
    }
    Festival.findById(id)
      .then((festival) => {
        // Hvis festival ikke kunne findes i databasen
        if (!festival) return res.status(404).send();
        // Festivalen blev fundet og vi sender den tilbage til brugeren
        res.status(200).send(festival);
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
  // PATCH: Opdater festival
  app.patch('/festivals/:id', (req, res) => {
    // Gem id fra URL
    let id = req.params.id;

  });
};