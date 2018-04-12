// Eksterne imports
const _ = require('lodash');
const { ObjectID } = require('mongodb');

// Interne imports
const { Article } = require('../models/Article');
const { getModelProperties } = require('../helpers/helpers');

module.exports = (app) => {
  // GET: Hent alle artikler
  app.get('/articles', (req, res) => {
    Article.find()
      .then((articles) => {
        res.status(200).send(articles);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  });
  // GET: Hent specifik artikel baseret på ID
  app.get('/articles/:id', (req, res) => {
    // Gem id fra URL
    let id = req.params.id;
    // Hvis id ikke er et valid ObjectID
    if (!ObjectID.isValid(id)) {
      return res.status(404).send('Invalid ObjectID');
    }
    Article.findById(id)
      .then((article) => {
        // Hvis artikel ikke kunne findes i databasen
        if (!article) return res.status(404).send();
        // Artiklen blev fundet og vi sender den tilbage til brugeren
        res.status(200).send(article);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  });
  // POST: Opret artikel
  app.post('/articles', (req, res) => {
    // Vælg de værdier som vi skal bruge fra request body
    let body = _.pick(req.body, getModelProperties(Article));
    // Lav ny artikel instance og sæt værdier til hvad der er blevet sendt med
    let article = new Article(body);
    // Gem articel i database
    article.save()
      .then((article) => {
        res.status(201).send(article);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  });
  // PATCH: Opdater artikel
  app.patch('/articles/:id', (req, res) => {
    // Gem id fra URL
    let id = req.params.id;
    // Vælg de værdier som vi skal bruge fra request body
    let body = _.pick(req.body, getModelProperties(Article));
    // Hvis id'et ikke er et korrekt ObjectID
    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }
    // Bestem hvad der skal opdateres (body) og få returneret den opdaterede artikel
    Article.findByIdAndUpdate(id, { $set: body }, { new: true })
      .then((article) => {
        // Hvis artiklen ikke kan findes i databasen
        if (!article) return res.status(404).send();
        // Send artikel til klient
        res.status(200).send(article);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  });
  // DELETE: Slet artikel
  app.delete('/articles/:id', (req, res) => {
    // Gem id fra URL
    let id = req.params.id;
    // Hvis id'et ikke er et korrekt ObjectID
    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }
    // Find artikel baseret på id og slet
    Article.findByIdAndRemove(id)
      .then((article) => {
        // Hvis artiklen ikke findes i databasen
        if (!article) return res.status(404).send();
        // Send den slettede artikel tilbage til klienten
        res.status(200).send(article);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  });
};