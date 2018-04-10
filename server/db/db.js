const mongoose = require('mongoose');

// Vi vil gerne bruge Promises
mongoose.Promise = global.Promise;

// Forbind til databasen
mongoose.connect(process.env.MONGODB_URI);

// Hvis man requirer denne fil, får man mongoose variablen med som allerede er forbundet til databasen
module.exports = {
  mongoose
};