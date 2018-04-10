const mongoose = require('mongoose');

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
    required: true
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
  followedGenres: [{
    type: String
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
  }]
});

const User = mongoose.model('User', UserSchema);

module.exports = {
  User
}