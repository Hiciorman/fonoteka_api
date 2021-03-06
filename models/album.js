var fs = require('fs');
var graphql = require('graphql');
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
mongoose.Promise = require('bluebird');
var track = require('./track');
var rating = require('./rating');
var genre = require('./genre');
var artist = require('./artist');
var comment = require('./comment');

var schema = new mongoose.Schema({
  title: String,
  artists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'artist'
  }],
  cover: String,
  sample: String,
  released: Date,
  length: String,
  genres: [{
    type: Number,
    ref: 'genre'
  }],
  averageRate: Number,
  tracks: [track.schema],
  ratings: [rating.schema],
  comments: [comment.schema]
})

var album = mongoose.model('album', schema);

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
      type: new graphql.GraphQLList(artist.type)
    },
    cover: {
      type: graphql.GraphQLString
    },
    sample: {
      type: graphql.GraphQLString
    },
    released: {
      type: graphql.GraphQLString
    },
    length: {
      type: graphql.GraphQLString
    },
    genres: {
      type: new graphql.GraphQLList(genre.type)
    },
    tracks: {
      type: new graphql.GraphQLList(track.outputType)
    },
    averageRate: {
      type: graphql.GraphQLFloat
    },
    ratings: {
      type: new graphql.GraphQLList(rating.outputType)
    },
    comments: {
      type: new graphql.GraphQLList(comment.outputType)
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
    sample: {
      name: 'sample',
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
      type: new graphql.GraphQLList(graphql.GraphQLInt)
    },
    tracks: {
      name: 'tracks',
      type: new graphql.GraphQLList(track.inputType)
    }
  },
  resolve: (root, args) => {
    if (!args.cover) {
      var bitmap = fs.readFileSync('./images/emptyCover.jpg');
      args.cover = 'data:image/jpeg;base64,'; 
      args.cover += new Buffer(bitmap).toString('base64');
    }
    var newAlbum = new album({
      title: args.title,
      artists: args.artists,
      cover: args.cover,
      sample: args.sample,
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
          else {
            if(args.artists)
            args.artists.forEach(function(x) {
              artist.model.findByIdAndUpdate(x,{"$push": {
                "albums": x
              }}).exec();

            }, this);
            resolve(newAlbum)
          }
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
      type: new graphql.GraphQLList(graphql.GraphQLInt)
    },
    tracks: {
      name: 'tracks',
      type: new graphql.GraphQLList(track.inputType)
    }
  },
  resolve: (root, args) => {
    return new Promise((resolve, reject) => {
      album
        .findOneAndUpdate({
          "_id": args._id
        }, {
          "$set": {
            "title": args.title,
            "artists": args.artists,
            "cover": args.cover,
            "released": args.released,
            "length": args.length,
            "genres": args.genres,
            "tracks": args.tracks
          }
        }, function (err, doc) {
          if (err) 
            reject(err);
          
          resolve(args);
        })
    })
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
      album
        .remove({
          "_id": args._id
        }, function (err, doc) {
          if (err) 
            reject(err);
          
          resolve(args);
        })
    })
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
      user_id: args.user_id,
      rate: args.rate
    }
    return new Promise((resolve, reject) => {
      if (newRating.rate < 1 || newRating.rate > 10) 
        reject("Rate should be between 1-10");
      else {
        album.findOneAndUpdate({
            "_id": args.album_id,
            "ratings.user_id": {
              $ne: args.user_id
            }
          }, {
            "$push": {
              "ratings": newRating
            }
          }).exec().then(() => 
          {
            album.aggregate([{
                "$match": {"_id": new ObjectID(args.album_id)}
              },{
                "$unwind": "$ratings"
              },{
                "$group": { "_id": "$_id", "averageRate": {"$avg": "$ratings.rate"} }
              }
            ]).exec((err,res) => {
                album.findOneAndUpdate({
                  "_id": res[0]._id
                }, {
                  "$set": {
                    "averageRate": res[0].averageRate.toFixed(2)
                  }
                }).exec();

                if (err) 
                    reject(err)
                else 
                    resolve(newRating)
            })
          })
      }
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
    user_id: {
      name: "user_id",
      type: new graphql.GraphQLNonNull(graphql.GraphQLID)
    },
    rate: {
      name: 'rate',
      type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
    }
  },
  resolve: (root, args) => {
    return new Promise((resolve, reject) => {
      album.findOneAndUpdate({
          "_id": args.album_id,
          "ratings.user_id": args.user_id
        }, {
          "$set": {
            "ratings.$.rate": args.rate
          }
        }, {
          runValidators: true
      }).exec().then(()=>
      { 
        album.aggregate([{
                "$match": {"_id": new ObjectID(args.album_id)}
              },{
                "$unwind": "$ratings"
              },{
                "$group": { "_id": "$_id", "averageRate": {"$avg": "$ratings.rate"} }
              }
            ]).exec((err,res) => {
                album.findOneAndUpdate({
                  "_id": res[0]._id
                }, {
                  "$set": {
                    "averageRate": res[0].averageRate.toFixed(2)
                  }
                }).exec();

                if (err) 
                    reject(err)
                else 
                    resolve(args)
            })
      }
      )
    })
  }
}

var albumCommentAdd = {
  type: comment.outputType,
  description: 'Add comment to album',
  args: {
    album_id: {
      name: 'album_id',
      type: new graphql.GraphQLNonNull(graphql.GraphQLID)
    },
    author: {
      name: 'author',
      type: new graphql.GraphQLNonNull(graphql.GraphQLID)
    },
    parent_id: {
      name: 'createDate',
      type: graphql.GraphQLID
    },
    body: {
      name: 'body',
      type: new graphql.GraphQLNonNull(graphql.GraphQLString)
    }
  },
  resolve: (root, args) => {
    var newComment = new comment.model({
      author: args.author,
      parent_id: args.parent_id,
      body: args.body,
      createDate: Date.now()
    })

    return new Promise((resolve, reject) => {
      album.findByIdAndUpdate(args.album_id, {
        "$push": {
          "comments": newComment
        }
      }).exec().then(() => {
          album.findById(args.album_id)
            .populate('comments.author')
            .lean()
            .exec(function (err, res) {
              if (err) 
                reject(err)
              else 
                resolve(res.comments[res.comments.length - 1])
            })
        });
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
  editRating: ratingEdit,
  addComment: albumCommentAdd
}