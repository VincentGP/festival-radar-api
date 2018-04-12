const mongoose = require('mongoose');

const FestivalSchema = new mongoose.Schema({
  location: {
    address: {
      type: String
    },
    city: {
      type: String
    },
    zip: {
      type: Number
    },
    country: {
      type: String
    },
    latLong: [{
      type: String
    }]
    // required: true
  },
  artists: [{
    type: String
  }],
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
    // required: true
  },
  name: {
    type: String,
    // required: true,
    unique: true
  },
  price: {
    type: String
  },
  availability: {
    type: Number,
    min: 1,
    max: 3
  },
  poster: {
    type: String
  },
  description: {
    type: String,
    // required: true
  },
  video: {
    type: String
  },
  link: {
    type: String,
    // required: true
  },
  popularity: {
    type: Number,
    default: 0
  }
});

const Festival = mongoose.model('Festival', FestivalSchema);

module.exports = {
  Festival
};