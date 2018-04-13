const mongoose = require('mongoose');

const ArtistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  genre: {
    type: String
  },
  popularity: {
    type: Number,
    default: 0
  }
});

const Artist = mongoose.model('Artist', ArtistSchema);

module.exports = {
  Artist
};