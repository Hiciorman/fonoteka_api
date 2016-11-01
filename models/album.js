var graphql = require('graphql');
var mongoose = require('mongoose');
var track = require('./track');

var album = {
  title: String,
  author_id: mongoose.Schema.Types.ObjectId,
  released: Date,
  length: String,
  genres: [String],
  tracks: [track.schema]
};

var albumType = new graphql.GraphQLObjectType({
  name: 'Album',
  fields: function () {
    return {
      _id: {
        type: graphql.GraphQLID
      },
      title: {
        type: graphql.GraphQLString
      },
      author_id: {
        type: graphql.GraphQLID
      },
      released: {
        type: graphql.GraphQLString
      },
      length: {
        type: graphql.GraphQLString
      },
      genres: {
        type: new graphql.GraphQLList(graphql.GraphQLString)
      },
      tracks: {
        type: new graphql.GraphQLList(track.type)
      }
    }
  }
});


module.exports = {
  schema: album,
  type: albumType
};