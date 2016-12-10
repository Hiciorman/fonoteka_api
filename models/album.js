var graphql = require('graphql');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var track = require('./track');
var rating = require('./rating');

var album = mongoose.model('album',{
  title: String,
  artists: [mongoose.Schema.Types.ObjectId],
  cover: String,
  released: Date,
  length: String,
  genres: [String],
  tracks: [track.schema],
  ratings: [rating.schema]
})

var albumType = new graphql.GraphQLObjectType({
  name: 'Album',
  fields: {
    _id: {
      type: graphql.GraphQLID
    },
    title: {
      type: graphql.GraphQLString
    },
    artists: {
      type: new graphql.GraphQLList(graphql.GraphQLID)
    },
    cover:{
      type: graphql.GraphQLString
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
      type: new graphql.GraphQLList(track.outputType)
    },
    ratings: {
      type: new graphql.GraphQLList(rating.outputType)
    }
  }
})

var albumAdd = {
  type: albumType,
  description: 'Add album',
  args: {
    title: {
      name: 'title',
      type: new graphql.GraphQLNonNull(graphql.GraphQLString)
    },
    artists: {
      name: 'artists',
      type: new graphql.GraphQLList(graphql.GraphQLID)
    },
    cover: {
      name: 'cover',
      type: graphql.GraphQLString
    },
    released: {
      name: 'released',
      type: graphql.GraphQLString
    },
    length: {
      name: 'length',
      type: graphql.GraphQLString
    },
    genres: {
      name: 'genres',
      type: new graphql.GraphQLList(graphql.GraphQLString)
    },
    tracks: {
      name: 'tracks',
      type: new graphql.GraphQLList(track.inputType)
    }
  },
  resolve: (root, args) => {
    var newAlbum = new album({
      title: args.title,
      artists: args.artists,
      cover: args.cover,
      released: args.released,
      length: args.length,
      genres: args.genres,
      tracks: args.tracks
    })
    return new Promise((resolve, reject) => {
      newAlbum.save(function (err) {
        if (err) reject(err)
        else resolve(newAlbum)
      })
    })
  }
}

module.exports = {
  model: album,
  type: albumType,
  add: albumAdd
}