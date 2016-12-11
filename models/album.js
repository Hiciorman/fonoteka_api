var graphql = require('graphql');
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
mongoose.Promise = require('bluebird');
var track = require('./track');
var rating = require('./rating');

var album = mongoose.model('album', {
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
      type: new graphql.GraphQLList(graphql.GraphQLID),
      ref: 'Artist'
    },
    cover: {
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
      newAlbum
        .save(function (err) {
          if (err)
            reject(err)
          else
            resolve(newAlbum)
        })
    })
  }
}

var albumEdit = {
  type: albumType,
  description: 'Edit album',
  args: {
    _id: {
      name: '_id',
      type: new graphql.GraphQLNonNull(graphql.GraphQLID)
    },
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
    return new Promise((resolve, reject) => {
      album.findOneAndUpdate({ "_id": args._id },
        {
          "$set": {
            "title": args.title,
            "artists": args.artists,
            "cover": args.cover,
            "released": args.released,
            "length": args.length,
            "genres": args.genres,
            "tracks": args.tracks
          }
        },
        function (err, doc) {
          if (err)
            reject(err);

          resolve(args);
        }
      )}
    )
  }
}

var albumDelete = {
  type: albumType,
  description: 'Delete album',
  args: {
    _id: {
      name: '_id',
      type: new graphql.GraphQLNonNull(graphql.GraphQLID)
    }
  },
  resolve: (root, args) => {
    return new Promise((resolve, reject) => {
      album.remove({ "_id": args._id },
        function (err, doc) {
          if (err)
            reject(err);

          resolve(args);
        }
      )}
    )
  }
}

var ratingAdd = {
  type: rating.outputType,
  description: "Add album rating",
  args: {
    album_id: {
      name: 'album_id',
      type: new graphql.GraphQLNonNull(graphql.GraphQLID)
    },
    user_id: {
      name: 'user_id',
      type: new graphql.GraphQLNonNull(graphql.GraphQLID)
    },
    rate: {
      name: 'rate',
      type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
    }
  },
  resolve: (root, args) => {
    var newRating = {
      _id: new ObjectID(),
      user_id: args.user_id,
      rate: args.rate
    }
    return new Promise((resolve, reject) => {
      album.findOneAndUpdate({ "_id": args.album_id },
        {
          "$push": {
            "ratings": newRating
          }
        },
        function (err, doc) {
          if (err)
            reject(err);

          resolve(newRating);
        }
      )
    })
  }
}

var ratingEdit = {
  type: rating.outputType,
  description: "Edit album rating",
  args: {
    album_id: {
      name: 'album_id',
      type: new graphql.GraphQLNonNull(graphql.GraphQLID)
    },
    rating_id: {
      name: "rating_id",
      type: new graphql.GraphQLNonNull(graphql.GraphQLID)
    },
    rate: {
      name: 'rate',
      type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
    }
  },
  resolve: (root, args) => {
    return new Promise((resolve, reject) => {
      album.findOneAndUpdate(
        { "_id": args.album_id, "ratings._id": args.rating_id },
        {
          "$set": {
            "ratings.$.rate": args.rate
          }
        },
        function (err, result) {
          if (err)
            reject(err);

          resolve(result);
        })
    })
  }
}

module.exports = {
  model: album,
  type: albumType,
  add: albumAdd,
  edit: albumEdit,
  delete: albumDelete,
  addRating: ratingAdd,
  editRating: ratingEdit
}