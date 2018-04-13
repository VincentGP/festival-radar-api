// Eksterne imports
const _ = require('lodash');
const { ObjectID } = require('mongodb');

// Interne imports
const { Artist } = require('../models/Artist');
const { getModelProperties } = require('../helpers/helpers');

module.exports = (app) => {
  // GET: Hent alle kunstnere
  app.get('/artists', (req, res) => {
    Artist.find()
      .then((artists) => {
        res.status(200).send(artists);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  });
  // GET: Hent specifik kunstner baseret på ID
  app.get('/artists/:id', (req, res) => {
    // Gem id fra URL
    let id = req.params.id;
    // Hvis id ikke er et valid ObjectID
    if (!ObjectID.isValid(id)) {
      return res.status(404).send('Invalid ObjectID');
    }
    Artist.findById(id)
      .then((artist) => {
        // Hvis kunster ikke kunne findes i databasen
        if (!artist) return res.status(404).send();
        // Kunstneren blev fundet og vi sender den tilbage til brugeren
        res.status(200).send(artist);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  });
  // POST: Opret kunster
  app.post('/artists', (req, res) => {
    // Vælg de værdier som vi skal bruge fra request body
    let body = _.pick(req.body, getModelProperties(Artist));
    // Lav ny kunstner instance og sæt værdier til hvad der er blevet sendt med
    let artist = new Artist(body);
    // Gem kunstner i database
    artist.save()
      .then((artist) => {
        res.status(201).send(artist);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  });
  // PATCH: Opdater kunstner
  app.patch('/artists/:id', (req, res) => {
    // Gem id fra URL
    let id = req.params.id;
    // Vælg de værdier som vi skal bruge fra request body
    let body = _.pick(req.body, getModelProperties(Artist));
    // Hvis id'et ikke er et korrekt ObjectID
    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }
    // Bestem hvad der skal opdateres (body) og få returneret den opdaterede kunstner
    Artist.findByIdAndUpdate(id, { $set: body }, { new: true })
      .then((artist) => {
        // Hvis kunstneren ikke kan findes i databasen
        if (!artist) return res.status(404).send();
        // Send kunstner til klient
        res.status(200).send(artist);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  });
  // DELETE: Slet kunstner
  app.delete('/artists/:id', (req, res) => {
    // Gem id fra URL
    let id = req.params.id;
    // Hvis id'et ikke er et korrekt ObjectID
    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }
    // Find kunstner baseret på id og slet
    Artist.findByIdAndRemove(id)
      .then((artist) => {
        // Hvis kunstneren ikke findes i databasen
        if (!artist) return res.status(404).send();
        // Send den slettede kunstner tilbage til klienten
        res.status(200).send(artist);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  });
};