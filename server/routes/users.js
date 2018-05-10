// Eksterne imports
const _ = require('lodash');
const { ObjectID } = require('mongodb');

// Interne imports
const { User } = require('../models/User');
const { authenticate } = require('../middleware/authenticate');
const { incrementPopularityArtist, incrementPopularityFestival, getModelProperties, decrementPopularityArtist, decrementPopularityFestival } = require('../helpers/helpers');

module.exports = (app) => {
  // POST: Signup som almindelig bruger
  app.post('/users', (req, res) => {
    // Lav bruger object baseret på request
    let user = new User(_.pick(req.body, ['email', 'password', 'firstName', 'lastName', 'location']));
    // Hvis der er uploadet nogle filer       
    if (req.files) {
      let file = req.files.avatar;      
      // Tilføj billede reference til bruger
      user.imagePath = req.files.avatar.name;
      // mv() bruges til at flytte filen
      file.mv(`server/public/uploads/${file.name}`, (err) => {
        if (err) {
          return res.status(400).send(err);
        }
      });
    }
    // Gem bruger
    user.save()
      .then((user) => {
        // Generer token på brugeren
        return user.generateAuthToken();
      })
      // Vi piper os videre i eksekveringen for at få adgang til den token der er blevet genereret
      .then((token) => {
        // Send token med i header og brugeren tilbage
        res.header('x-auth', token).status(200).send(user);
      })
      .catch((err) => {
        // Hvis der gik noget galt med generering af token
        res.status(400).send(err);
      })
      .catch((err) => {
        // Hvis der gik noget galt med oprettelse af bruger
        res.status(400).send(err);
      });
  });
  //
  app.post('/users/login', (req, res) => {
    let body = _.pick(req.body, ['email', 'password']);
    User.findByCredentials(body.email, body.password)
      .then((user) => {
        return user.generateAuthToken()
          .then((token) => {
            res.header('x-auth', token).status(200).send({ user, expiresIn: 3600 * 24 });
          });
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  });
  
  
  app.get('/users/validate', authenticate, (req, res) => {
    let user = req.user;    
    res.status(200).send(user);
  });
  // PATCH: Opdater brugeren som er logget ind
  app.patch('/users', authenticate, (req, res) => {
    // Gem id
    let id = req.user._id;
    // Vælg de værdier som vi skal bruge fra request body
    let body = _.pick(req.body, getModelProperties(User));
    // Hvis id'et ikke er et korrekt ObjectID
    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }
    // Bestem hvad der skal opdateres (body) og få returneret den opdaterede bruger
    User.findByIdAndUpdate(id, { $set: body }, { new: true })
      .then((user) => {
        // Hvis brugeren ikke kan findes i databasen
        if (!user) return res.status(404).send();
        // Send bruger til klient
        res.status(200).send(user);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  });
  // DELETE: Log bruger ud
  app.delete('/users', authenticate, (req, res) => {
    // Brugerobjektet + token (der kommer fra req) stammer fra vores authenticate middleware
    let user = req.user;
    let token = req.token;
    user.removeToken(token)
      .then(() => {
        res.status(200).send();
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  });
  // POST: Tilføj kunster til favoritter
  app.post('/users/artists/:id', authenticate, (req, res) => {
    // Gem nuværende bruger
    let user = req.user;
    let artistId = ObjectID(req.params.id);
    // Hvis id'et ikke er et korrekt ObjectID    
    if (!ObjectID.isValid(artistId)) {
      return res.status(404).send();
    }
    // Inkrementer kunstnerens popularitet
    incrementPopularityArtist(artistId);
    // Push kunstner til brugerens favorit array
    user.update({ $addToSet: { followedArtists: artistId }})
      .then((user) => {
        res.status(200).send(user);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  });
  // POST: Tilføj festival til favoritter
  app.post('/users/festivals/:id', authenticate, (req, res) => {
    // Gem nuværende bruger
    let user = req.user;    
    let festivalId = ObjectID(req.params.id);
    // Hvis id'et ikke er et korrekt ObjectID    
    if (!ObjectID.isValid(festivalId)) {
      return res.status(404).send();
    }
    // Inkrementer kunstnerens popularitet
    incrementPopularityFestival(festivalId);
    // Push festival til brugerens favorit array
    user.update({ $addToSet: { followedFestivals: festivalId } })
      .then((user) => {
        res.status(200).send(user);
      })
      .catch((err) => {
        res.status(400).send(err); 
      });
  });
  // DELETE: Fjern kunstner fra favoritter
  app.delete('/users/artists/:id', authenticate, (req, res) => {
    // Gem nuværende bruger
    let user = req.user;
    let artistId = ObjectID(req.params.id);
    // Hvis id'et ikke er et korrekt ObjectID    
    if (!ObjectID.isValid(artistId)) {      
      return res.status(404).send();
    }
    // Dekrementer popularitet
    decrementPopularityArtist(artistId);
    // Fjern kunstner fra brugerens favorit array
    user.update({ $pull: { followedArtists: artistId } })
      .then((user) => {
        res.status(200).send(user);
      })
      .catch((err) => {
        res.status(400).send(err); 
      });
  });
  // DELETE: Fjern festival fra favoritter
  app.delete('/users/festivals/:id', authenticate, (req, res) => {
    // Gem nuværende bruger
    let user = req.user;
    let festivalId = ObjectID(req.params.id);
    // Hvis id'et ikke er et korrekt ObjectID
    if (!ObjectID.isValid(festivalId)) {
      return res.status(404).send();
    }
    // Dekrementer popularitet
    decrementPopularityFestival(festivalId);
    // Fjern festival fra brugerens favorit array
    user.update({ $pull: { followedFestivals: festivalId } })
      .then((user) => {
        res.status(200).send(user);
      })
      .catch((err) => {
        res.status(400).send(err); 
      });
  });
};