const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');

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
  },
  image: {
    type: String
  }
});

// Lav venlig URL slug baseret på navn
ArtistSchema.plugin(URLSlugs('name'));

const Artist = mongoose.model('Artist', ArtistSchema);

module.exports = {
  Artist
};