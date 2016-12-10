var graphql = require('graphql');
var mongoose = require('mongoose');
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
                first: {
                    name: 'first',
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
                    if (args.first != null) {
                        result.limit(args.first)
                    }
                })
            }
        },
        artists: {
            type: new graphql.GraphQLList(artist.type),
            args: {
                name: {
                    name: 'name',
                    type: graphql.GraphQLString
                },
                first: {
                    name: 'first',
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
                    if (args.name != null) 
                        result.where('name').equals(args.name);
                    if (args.first != null) 
                        result.limit(args.first);
                    }
                )
            }
        },
        albums: {
            type: new graphql.GraphQLList(album.type),
            args: {
                title: {
                    name: 'title',
                    type: graphql.GraphQLString
                },
                first: {
                    name: 'first',
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
                    if (args.name != null) 
                        result.where('name').equals(args.name);
                    if (args.first != null) 
                        result.limit(args.first);
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