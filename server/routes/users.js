// Eksterne imports
const _ = require('lodash');
const { ObjectID } = require('mongodb');

// Interne imports
const { User } = require('../models/User');
const { authenticate } = require('../middleware/authenticate');

module.exports = (app) => {
  // POST: Signup som almindelig bruger
  app.post('/users', (req, res) => {
    // Lav bruger object baseret på request
    let user = new User(_.pick(req.body, ['email', 'password', 'firstName', 'lastName']));    
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
  // POST: Login som almindelig bruger
  app.post('/users/login', (req, res) => {
    let body = _.pick(req.body, ['email', 'password']);
    // Find bruger baseret på request body
    User.findByCredentials(body.email, body.password)
      .then((user) => {
        // Fjern token hvis der er en nuværende (i tilfælde af at token manuelt bliver ændret ellers kan det resultere i at der kan gemmes mange tokens på en bruger)
        let auth = user.tokens;        
        // Hvis der er en token
        if (auth) user.removeToken();
        // Der skal genereres ny auth token hver gang bruger logger ind
        return user.generateAuthToken()
          .then((token) => {
            // Send header tilbage til bruger med brugerinfo, token og udløbstid
            res.header('x-auth', token).status(200).send({ user, expiresIn: 3600 });
          });
      })
      .catch((err) => {
        // Hvis bruger ikke kunne findes        
        res.status(400).send(err);
      });
  });
  // HEAD: Validér token ved automatisk login
  app.head('/users/validate', authenticate, (req, res) => {
    res.status(200).send();
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
  app.post('/users/artists', authenticate, (req, res) => {
    // Gem nuværende bruger
    let user = req.user;
    let artistId = ObjectID(req.body.artistId);
    // Hvis id'et ikke er et korrekt ObjectID    
    if (!ObjectID.isValid(artistId)) {
      return res.status(404).send();
    }
    // Push kunstner til brugerens favorit array
    user.update({ $addToSet: { followedArtists: artistId } })
      .then((user) => {
        res.status(200).send(user);
      })
      .catch((err) => {
        res.status(400).send(err); 
      });
  });
  // POST: Tilføj festival til favoritter
  app.post('/users/festivals', authenticate, (req, res) => {
    // Gem nuværende bruger
    let user = req.user;    
    let festivalId = ObjectID(req.body.festivalId);
    // Hvis id'et ikke er et korrekt ObjectID    
    if (!ObjectID.isValid(festivalId)) {
      return res.status(404).send();
    }
    // Push festival til brugerens favorit array
    user.update({ $addToSet: { followedFestivals: festivalId } })
      .then((user) => {
        res.status(200).send(user);
      })
      .catch((err) => {
        res.status(400).send(err); 
      });
  });
  // POST: Tilføj genre til favoritter
  app.post('/users/genres', authenticate, (req, res) => {
    // Gem nuværende bruger
    let user = req.user;      
    let genre = req.body.genre;
    // Push genre til brugerens favorit array
    user.update({ $addToSet: { followedGenres: genre } })
      .then((user) => {
        res.status(200).send(user);
      })
      .catch((err) => {
        res.status(400).send(err); 
      });
  });
  // DELETE: Fjern kunstner fra favoritter
  app.delete('/users/artists', authenticate, (req, res) => {
    // Gem nuværende bruger
    let user = req.user;
    let artistId = ObjectID(req.body.artistId);
    // Hvis id'et ikke er et korrekt ObjectID    
    if (!ObjectID.isValid(artistId)) {      
      return res.status(404).send();
    }
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
  app.delete('/users/festivals', authenticate, (req, res) => {
    // Gem nuværende bruger
    let user = req.user;
    let festivalId = ObjectID(req.body.festivalId);
    // Hvis id'et ikke er et korrekt ObjectID    
    if (!ObjectID.isValid(festivalId)) {      
      return res.status(404).send();
    }
    // Fjern festival fra brugerens favorit array
    user.update({ $pull: { followedFestivals: festivalId } })
      .then((user) => {
        res.status(200).send(user);
      })
      .catch((err) => {
        res.status(400).send(err); 
      });
  });
  // DELETE: Fjern genre fra favoritter
  app.delete('/users/genres', authenticate, (req, res) => {
    // Gem nuværende bruger
    let user = req.user;
    let genre = req.body.genre;
    // Fjern genre fra brugerens favorit array
    user.update({ $pull: { followedGenres: genre } })
      .then((user) => {
        res.status(200).send(user);
      })
      .catch((err) => {
        res.status(400).send(err); 
      });
  });
};