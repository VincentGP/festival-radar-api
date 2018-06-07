const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  imagePath: {
    type: String
  },
  followedArtists: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  followedLocations: [{
    city: {
      type: String
    },
    country: {
      type: String
    }
  }],
  followedFestivals: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  authToken: {
    type: String,
    require: true
  }
});

// Når man bruger .methods laver man instance methods (metoder vi kan bruge herinde)
// Når man bruger .statics laver man model metoder

UserSchema.methods.generateAuthToken = function () {
  let user = this;
  let token = jwt.sign({ _id: user._id.toHexString() }, process.env.JWT_SECRET).toString();
  user.authToken = token;
  return user.save()
    .then(() => {
      return token;
    })
    .catch(() => {
      return 'Token could not be generated';
    });
};

// Remove authentication token from user
UserSchema.methods.removeToken = function() {
  // The current user
  let user = this;  
  // Remove authentication token from user with $unset
  return user.update({
    $unset: {
      authToken: user.authToken
    }
  });
};

// Metode som bruges til at finde bruger baseret på token
UserSchema.statics.findByToken = function(token) {
  // Gem brugeren vi arbejder med
  let User = this;
  let decoded;
  // Prøver at køre koden og hvis noget fejler kører den ikke videre i funktionen
  try {
    // Test om token kan verificeres
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } 
  catch(err) {
    // Hvis den fejler returnerer vi et promise som altid vil rejecte
    return Promise.reject();
  }
  // Hvis verificering lykkedes finder vi brugeren baseret på id og token og returnerer
  return User.findOne({
    _id: decoded._id,
    authToken: token
  });
};

// Metode til at finde bruger baseret på email og password
UserSchema.statics.findByCredentials = function(email, password) {
  // Brugeren vi arbejder med
  let User = this;
  // Find bruger baseret på email
  return User.findOne({email})
    .then((user) => {
      // Hvis bruger ikke eksisterer i databasen
      if (!user) {
        return Promise.reject();
      }
      return new Promise((resolve, reject) => {
        // Sammenlign passwords
        bcrypt.compare(password, user.password, (err, res) => {
          if (res) {
            resolve(user);
          } else {
            reject(err);
          }
        });
      });
    });
};

// Run when user is saved
UserSchema.pre('save', function(next) {
  let user = this;  
  // Only run if there is a password
  if (user.isModified('password')) {
    // Genererate salt
    bcrypt.genSalt(10, (err, salt) => {
      // Generate hash
      bcrypt.hash(user.password, salt, (err, hash) => {
        // Change password to hashed value
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

// Password skal hashes igen hvis brugeren har opdateret det
UserSchema.pre('findOneAndUpdate', function(next) {  
  // De dele af brugeren som er blevet opdateret
  let user = this._update.$set;  
  // Kør kun hvis det er passwordet der er ændret eller oprettet
  if (user.password) {
    // Generer salt (10 runder)
    bcrypt.genSalt(10, (err, salt) => {
      // Generer hash baseret på brugerens plaintext password
      bcrypt.hash(user.password, salt, (err, hash) => {            
        // Sæt kodeordet til den hashede udgave
        user.password = hash;
        // Lad flowet fortsætte
        next();
      });
    });
  } else {
    next();
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = {
  User
};