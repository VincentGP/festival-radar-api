// Eksterne imports
const _ = require('lodash');
const { ObjectID } = require('mongodb');

// Interne imports
const { Festival } = require('../models/Festival');

// Generer automatisk body baseret på modellen og gem i variabel
const festivalBody = [];
Festival.schema.eachPath((path) => {
  if (path != '_id' && path != '__v') {
    festivalBody.push(path);
  }
});

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
    let body = _.pick(req.body, festivalBody);
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
    // Vælg de værdier som vi skal bruge fra request body
    let body = _.pick(req.body, festivalBody);
    // Hvis id'et ikke er et korrekt ObjectID
    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }
    // Bestem hvad der skal opdateres (body) og få returneret den opdaterede festival
    Festival.findByIdAndUpdate(id, { $set: body }, { new: true })
      .then((festival) => {
        // Hvis festivalen ikke kan findes i databasen
        if (!festival) return res.status(404).send();
        // Send festival til klient
        res.status(200).send(festival);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  });
  // DELETE: Slet festival
  app.delete('/festivals/:id', (req, res) => {
    // Gem id fra URL
    let id = req.params.id;
    // Hvis id'et ikke er et korrekt ObjectID
    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }
    // Find festival baseret på id og slet
    Festival.findByIdAndRemove(id)
      .then((festival) => {
        // Hvis festivalen ikke findes i databasen
        if (!festival) return res.status(404).send();
        // Send den slettede festival tilbage til klienten
        res.status(200).send(festival);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  });
};