var graphql = require('graphql');
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
mongoose.connect('mongodb://localhost/fonoteka');
mongoose.Promise = require('bluebird');

var user = require('./models/user')
var artist = require('./models/artist');
var album = require('./models/album');

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
                    if (args._id != null) 
                        result.where('_id').equals(new ObjectID(args._id))
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
                    if (args._id != null) 
                        result.where('_id').equals(new ObjectID(args.id))
                    if (args.name != null) 
                        result.where('name').equals(args.name);
                    if (args.limit != null) 
                        result.limit(args.limit);
                    }
                )
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
                    if (args._id != null) 
                        result.where('_id').equals(new ObjectID(args.id))
                    if (args.name != null) 
                        result.where('name').equals(args.name);
                    if (args.limit != null) 
                        result.limit(args.limit);
                    }
                )
            }
        }
    })
})

var mutationType = new graphql.GraphQLObjectType({
    name: 'Mutation',
    fields: {
        artistAdd: artist.add,
        albumAdd: album.add
    }
});

module.exports = new graphql.GraphQLSchema({query: query, mutation: mutationType});