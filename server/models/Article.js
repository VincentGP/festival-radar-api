const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  title: {
    type: String
  },
  body: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now()
  },
  comments: [{
    comment: {
      type: String
    },
    creator: {
      type: String
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId
    },
    date: {
      type: Date,
      default: Date.now()
    }
  }]
});

const Article = mongoose.model('Article', ArticleSchema);

module.exports = {
  Article
}