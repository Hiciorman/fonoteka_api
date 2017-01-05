var graphql = require('graphql');
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
mongoose.connect('mongodb://localhost/fonoteka');
mongoose.Promise = require('bluebird');

var user = require('./models/user')
var artist = require('./models/artist');
var album = require('./models/album');
var post = require('./models/post');

var query = new graphql.GraphQLObjectType({
    name: 'query',
    fields: () => ({
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
                        .find((err, users) => {
                            if (err) 
                                reject(err)
                            else 
                                resolve(users)
                        });
                    if (args.id != null) 
                        result.where({
                            _id: new ObjectID(args._id)
                        })
                    if (args.limit != null) 
                        result.limit(args.limit)
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
                        .find((err, artists) => {
                            if (err) 
                                reject(err)
                            else 
                                resolve(artists)
                        });
                    if (args.id != null) 
                        result.where({
                            _id: new ObjectID(args.id)
                        });
                    if (args.name != null) 
                        result.where({name: args.name});
                    if (args.limit != null) 
                        result.limit(args.limit);
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
                genre: {
                    name: 'genre',
                    type: graphql.GraphQLString
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
                        .aggregate([
                            {
                                "$unwind": "$ratings"
                            }, {
                                "$group": {
                                    "_id": "$_id",
                                    "title": {
                                        "$first": "$title"
                                    },
                                    "released": {
                                        "$first": "$released"
                                    },
                                    "averageRate": {
                                        "$avg": "$ratings.rate"
                                    }
                                }
                            }, {
                                "$sort": {
                                    "averageRate": -1
                                }
                            }
                        ]);
                    //bind to rest of data
                    if (args.released != null) 
                        result.where({released: args.released});
                    if (args.genre != null) 
                        result.where({genres: args.genre})

                    result.limit(args.limit);

                    resolve(result);
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
                limit: {
                    name: 'limit',
                    type: graphql.GraphQLInt
                }
            },
            resolve: (root, args) => {
                return new Promise((resolve, reject) => {
                    var result = album
                        .model
                        .find((err, albums) => {
                            if (err) 
                                reject(err)
                            else 
                                resolve(albums)
                        });
                    if (args.id != null) 
                        result.where({
                            _id: new ObjectID(args.id)
                        })
                    if (args.title != null) 
                        result.where({title: args.title});
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
        artistAdd: artist.add,
        artistEdit: artist.edit,
        artistDelete: artist.delete,
        albumAdd: album.add,
        albumEdit: album.edit,
        albumDelete: album.delete,
        ratingAdd: album.addRating,
        ratingEdit: album.editRating,
        postAdd: post.add
    }
});

module.exports = new graphql.GraphQLSchema({query: query, mutation: mutationType});