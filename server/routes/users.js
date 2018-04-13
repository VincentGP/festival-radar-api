// Eksterne imports
const _ = require('lodash');

// Interne imports
const { User } = require('../models/User');

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
};