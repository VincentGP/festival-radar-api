// Eksterne imports
const { Artist } = require('../models/Artist');
const { Festival } = require('../models/Festival');

const getModelProperties = (model) => {
  // Generer automatisk body baseret på modellen og gem i variabel
  let body = [];
  model.schema.eachPath((path) => {
    if (path != '_id' && path != '__v') {
      body.push(path);
    }
  });
  return body;
};
const incrementPopularityArtist = (id) => {
  Artist.findByIdAndUpdate(id, { $inc: { 'popularity': 1, } }, { new: true })
    .then((artist) => {
      return artist;
    })
    .catch((err) => {
      return err;
    });
};
const incrementPopularityFestival = (id) => {
  Festival.findByIdAndUpdate(id, { $inc: { 'popularity': 1, } }, { new: true })
    .then((festival) => {
      return festival;
    })
    .catch((err) => {
      return err;
    });
};

module.exports = {
  getModelProperties,
  incrementPopularityArtist,
  incrementPopularityFestival
};