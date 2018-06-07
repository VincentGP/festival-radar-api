// Eksterne imports
const _ = require('lodash');
const { ObjectID } = require('mongodb');

// Interne imports
const { Festival } = require('../models/Festival');
const { getModelProperties } = require('../helpers/helpers');

module.exports = (app) => {
  // GET: All festivals
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
    let festival = new Festival(_.pick(req.body, ['link', 'description', 'name', 'startDate', 'endDate', 'address', 'zip', 'city', 'country']));
    // Hvis der er uploadet nogle filer       
    if (req.files) {
      let file = req.files.poster;      
      // Tilføj billede reference til festival
      festival.poster = req.files.poster.name;
      // mv() bruges til at flytte filen
      file.mv(`server/public/uploads/festivals/${file.name}`, (err) => {
        if (err) {
          return res.status(400).send(err);
        }
      });
    }
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
    let body = _.pick(req.body, getModelProperties(Festival));
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