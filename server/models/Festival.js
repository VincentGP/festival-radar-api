// Eksterne imports
const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');

const FestivalSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true    
  },
  city: {
    type: String,
    required: true    
  },
  zip: {
    type: String,
    required: true    
  },
  country: {
    type: String,
    required: true
  },
  artists: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  poster: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  popularity: {
    type: Number,
    default: 0
  }
});

// Lav venlig URL slug baseret på navn
FestivalSchema.plugin(URLSlugs('name'));

const Festival = mongoose.model('Festival', FestivalSchema);

module.exports = {
  Festival
};