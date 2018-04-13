// Interne imports
const { User } = require('../models/User');

// Middleware authenticate
const authenticate = (req, res, next) => {
  // Hent token fra vores custom authentication header
  let token = req.header('x-auth');  
  // Vi bruger vores hjemmelavede metode til at finde frem til bruger ud fra token fra header
  User.findByToken(token)
    .then((user) => {
      // Hvis der ikke kan findes nogen bruger
      if (!user) {
        return Promise.reject();
      }
      // Her modificerer vi request objektet(sætter bruger og token på det) og sender det videre så vi kan eksekvere resten af vores flow i vores routes fil
      req.user = user;
      req.authToken = token;
      next();
    })
    .catch((err) => {            
      res.status(401).send(err);
    });
};

module.exports = {
  authenticate
};