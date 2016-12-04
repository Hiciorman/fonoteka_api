var graphql = require('graphql');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var track = require('./track');
var rating = require('./rating');

var albumSchema = mongoose.Schema({
  title: String,
  band_id: mongoose.Schema.Types.ObjectId,
  artists: [mongoose.Schema.Types.ObjectId],
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
    band_id: {
      type: graphql.GraphQLID
    },
    artists: {
      type: new graphql.GraphQLList(graphql.GraphQLID)
    },
    title: {
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
    band_id: {
      name: 'band_id',
      type: graphql.GraphQLID
    },
    artists: {
      name: 'artists',
      type: new graphql.GraphQLList(graphql.GraphQLID)
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
      band_id: args.band_id,
      artists: args.artists,
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
  model: mongoose.model('album', albumSchema),
  type: albumType,
  add: albumAdd
}