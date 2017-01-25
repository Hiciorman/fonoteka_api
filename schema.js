var graphql = require('graphql');
var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var ObjectID = require('mongodb').ObjectID;
var connection = mongoose.connect('mongodb://localhost/fonoteka');
autoIncrement.initialize(connection);
mongoose.Promise = require('bluebird');

var friendRequest = require('./models/friendRequest');
var user = require('./models/user')
var artist = require('./models/artist');
var album = require('./models/album');
var post = require('./models/post');
var genre = require('./models/genre');
genre.schema.plugin(autoIncrement.plugin, 'genre');

var query = new graphql.GraphQLObjectType({
    name: 'query',
    fields: () => ({
        friendRequests: {
            type: new graphql.GraphQLList(friendRequest.type),
            args: {
                from: {
                    name: 'from',
                    type: graphql.GraphQLID
                },
                to: {
                    name: 'to',
                    type: graphql.GraphQLID
                },
                status: {
                    name: 'status',
                    type: graphql.GraphQLID
                },
                limit: {
                    name: 'limit',
                    type: graphql.GraphQLInt
                }
            },
            resolve: (root, args) => {
                return new Promise((resolve, reject) => {
                    var result = friendRequest
                        .model
                        .find()
                    
                    if (args.from != null) 
                        result.where({
                            from: new ObjectID(args.from)
                        })
                    if (args.to != null) 
                        result.where({
                            to: new ObjectID(args.to)
                        })
                    if (args.status != null) 
                        result.where({status: args.status})
                    if (args.limit != null) 
                        result.limit(args.limit)

                     result.exec((err, res) => {
                        if (err) 
                            reject(err);
                        else 
                            resolve(res);
                    });
                })
            }
        },
        users: {
            type: new graphql.GraphQLList(user.type),
            args: {
                id: {
                    name: 'id',
                    type: graphql.GraphQLID
                },
                limit: {
                    name: 'limit',
                    type: graphql.GraphQLInt
                }
            },
            resolve: (root, args) => {
                return new Promise((resolve, reject) => {
                    var result = user
                        .model
                        .find()
                        .populate('friends')
                        .lean();

                    if (args.id != null) 
                        result.where({
                            _id: new ObjectID(args.id)
                        })
                    if (args.limit != null) 
                        result.limit(args.limit)

                     result.exec((err, res) => {
                        if (err) 
                            reject(err);
                        else 
                            resolve(res);
                    });
                })
            }
        },
        artists: {
            type: new graphql.GraphQLList(artist.type),
            args: {
                id: {
                    name: 'id',
                    type: graphql.GraphQLString
                },
                name: {
                    name: 'name',
                    type: graphql.GraphQLString
                },
                limit: {
                    name: 'limit',
                    type: graphql.GraphQLInt
                }
            },
            resolve: (root, args) => {
                return new Promise((resolve, reject) => {
                    var result = artist
                        .model
                        .find();
                        //.populate('albums')
                       // .lean();
                    if (args.id != null) 
                        result.where({
                            _id: new ObjectID(args.id)
                        });
                    if (args.name != null) 
                        result.where({name: { $regex: '(?i).*' + args.name + '.*'}});
                    if (args.limit != null) 
                        result.limit(args.limit);

                    result.exec((err, res) => {
                        if (err) 
                            reject(err);
                        else 
                            resolve(res);
                    });
                    }
                )
            }
        },
        rankedAlbums: {
            type: new graphql.GraphQLList(album.type),
            args: {
                released: {
                    name: 'released',
                    type: graphql.GraphQLString
                },
                genres:{
                    name: 'genres',
                    type: new graphql.GraphQLList(graphql.GraphQLInt)
                },
                limit: {
                    name: 'limit',
                    type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
                }
            },
            resolve: (root, args) => {
                return new Promise((resolve, reject) => {
                    var result = album
                        .model
                        .find()
                        .sort({averageRate: -1})
                        .populate('genres')
                        .populate('artists')
                        .lean();

                    if (args.released != null) {
                        var start = new Date(args.released, 1, 1);
                        var end = new Date(args.released, 12, 31);
                        result.where({released: {$gte: start, $lte: end}});
                    }
                    if (args.genres != null) 
                        result.where({"genres": {$in: args.genres}})

                    result.limit(args.limit);

                    result.exec((err, res) => {
                        if (err) 
                            reject(err);
                        else 
                            resolve(res);
                        }
                    );
                })
            }
        },
        albums: {
            type: new graphql.GraphQLList(album.type),
            args: {
                id: {
                    name: 'id',
                    type: graphql.GraphQLID
                },
                title: {
                    name: 'title',
                    type: graphql.GraphQLString
                },
                genres:{
                    name: 'genres',
                    type: new graphql.GraphQLList(graphql.GraphQLInt)
                },
                ratingUserId:{
                    name: 'ratingUserId',
                    type: graphql.GraphQLID
                },
                limit: {
                    name: 'limit',
                    type: graphql.GraphQLInt
                }
            },
            resolve: (root, args) => {
                return new Promise((resolve, reject) => {
                    var result = album
                        .model
                        .find()
                        .populate('genres')
                        .populate('artists')
                        .populate('comments.author')
                        .lean();

                    if (args.id != null) 
                        result.where({
                            _id: new ObjectID(args.id)
                        })
                    if (args.title != null) 
                        result.where({title: { $regex: '(?i).*' + args.title + '.*'}});
                    if(args.genres != null)
                        result.where({"genres": {$in: args.genres}})
                    if(args.ratingUserId != null)
                        result.where({"ratings.user_id": args.ratingUserId})
                    if (args.limit != null) 
                        result.limit(args.limit);

                    result.exec((err, res) => {
                        if (err) 
                            reject(err);
                        else
                            resolve(res);
                    });
                })
            }
        },
        genres: {
            type: new graphql.GraphQLList(genre.type),
            args: {
                id: {
                    name: 'id',
                    type: graphql.GraphQLID
                },
                label: {
                    name: 'label',
                    type: graphql.GraphQLString
                },
                limit: {
                    name: 'limit',
                    type: graphql.GraphQLInt
                }
            },
            resolve: (root, args) => {
                return new Promise((resolve, reject) => {
                    var result = genre
                        .model
                        .find((err, genres) => {
                            if (err) 
                                reject(err)
                            else 
                                resolve(genres)
                        });
                    if (args.id != null) 
                        result.where({
                            _id: new ObjectID(args.id)
                        })
                    if (args.title != null) 
                        result.where({title:args.title});
                    if (args.limit != null) 
                        result.limit(args.limit);
                    }
                )
            }
        },
        posts: {
            type: new graphql.GraphQLList(post.type),
            args: {
                id: {
                    name: 'id',
                    type: graphql.GraphQLID
                },
                title: {
                    name: 'title',
                    type: graphql.GraphQLString
                },
                author: {
                    name: 'author',
                    type: graphql.GraphQLString
                },
                limit: {
                    name: 'limit',
                    type: graphql.GraphQLInt
                }
            },
            resolve: (root, args) => {
                return new Promise((resolve, reject) => {
                    var result = post
                        .model
                        .find()
                        .populate('author')
                        .populate('comments.author')
                        .lean();

                    if (args.id != null) 
                        result.where({
                            _id: new ObjectID(args.id)
                        })
                    if (args.title != null) 
                        result.where({title: args.title});
                    if (args.author != null) 
                        result.where({author: args.author});
                    if (args.limit != null) 
                        result.limit(args.limit);
                    
                    result.exec((err, res) => {
                        if (err) 
                            reject(err);
                        else 
                            resolve(res);
                        }
                    );
                })
            }
        }
    })
})

var mutationType = new graphql.GraphQLObjectType({
    name: 'Mutation',
    fields: {
        userEdit: user.edit,
        friendAdd: user.addFriend,
        friendRequestAdd: friendRequest.add,
        friendRequestUpdate: friendRequest.update,
        artistAdd: artist.add,
        artistEdit: artist.edit,
        artistDelete: artist.delete,
        albumAdd: album.add,
        albumEdit: album.edit,
        albumDelete: album.delete,
        ratingAdd: album.addRating,
        ratingEdit: album.editRating,
        albumCommentAdd: album.addComment,
        postAdd: post.add,
        postCommentAdd: post.addComment,
        genreAdd: genre.add,
        genreDelete: genre.delete
    }
});

module.exports = new graphql.GraphQLSchema({query: query, mutation: mutationType});