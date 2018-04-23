const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');

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
  image: {
    type: String
  },
  comments: [{
    comment: {
      type: String,
      required: true
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

// Lav venlig URL slug baseret på navn
ArticleSchema.plugin(URLSlugs('title'));

const Article = mongoose.model('Article', ArticleSchema);

module.exports = {
  Article
};