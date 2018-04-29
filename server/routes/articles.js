// Eksterne imports
const _ = require('lodash');
const { ObjectID } = require('mongodb');

// Interne imports
const { Article } = require('../models/Article');
const { User } = require('../models/User');
const { getModelProperties, dedupeIDs } = require('../helpers/helpers');
const { authenticate } = require('../middleware/authenticate');

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

  app.post('/upload', (req, res) => {
    res.send(req.files);
    
  });
  // POST: Opret artikel
  app.post('/articles', (req, res) => {
    // Hvis der er uploadet nogle filer
    if (req.files) {
      let file = req.files.image;
      // mv() funktion bruges til at flytte filen
      file.mv(`server/public/uploads/${file.name}`, (err) => {
        if (err) {
          return res.status(400).send(err);
        }
      });
    }
    // Vælg de værdier som vi skal bruge fra request body
    let article = new Article(_.pick(req.body, ['title', 'body']));
    // Tilføj billede reference til bruger (eller tom string)
    article.image = req.files.image.name || '';
    // Gem artikel i database
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
  // POST: Opret kommentar
  app.post('/articles/:slug/comment', authenticate, (req, res) => {
    // Gem artiklens id
    let user = req.user;
    let slug = req.params.slug;
    // Lav kommentar baseret på body og brugeren som er logget ind
    let comment = _.pick(req.body, ['comment']);
    comment.creator = user.email;
    comment.creatorId = user._id;    
    // Find artikel baseret på id
    Article.findOne({ slug })
      .then((article) => {
        // Tilføj kommentar til artikel
        article.comments.push(comment);
        // Gem så artiklen efter kommentar er blevet tilføjet
        article.save()
          .then((article) => {
            // Send kommentarer med tilbage
            res.status(200).send(article.comments);
          })
          .catch((err) => {
            res.status(400).send(err); 
          });
      })
      .catch((err) => {        
        res.status(400).send(err);
      });
  });
  // GET: Returnerer brugere som har kommenteret på en artikel
  app.get('/articles/:slug/users', (req, res) => {
    // Gem id fra URL
    let slug = req.params.slug;
    Article.findOne({ slug })
      .then((article) => {
        // Hvis artikel ikke kunne findes i databasen
        if (!article) return res.status(404).send();
        // Gem ObjectIDs og fjern mulige duplikeringer
        let objectIDs = dedupeIDs(article.comments.map(comment => comment.creatorId));
        // Find frem til brugerne som har kommenteret baseret på id'erne og vælg så felter vi vil have sendt med
        User.find({
          _id: { $in: objectIDs }
        }).select(['firstName', 'imagePath'])
          .then((users) => {
            res.status(200).send(users);
          })
          .catch((err) => {
            res.status(400).send(err);
          });
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  });
};