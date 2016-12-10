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
        getAllUsers: {
            type: new graphql.GraphQLList(user.type),
            resolve: () => {
                return new Promise((resolve, reject) => {
                    user.model.find((err, getAllUsers) => {
                        if (err) reject(err)
                        else resolve(getAllUsers)
                    })
                })
            }
        },
        artists: {
            type: new graphql.GraphQLList(artist.type),
            args: {
                name: {
                    name: 'name',
                    type: graphql.GraphQLString
                }
            },
            resolve: (root, args) => {
                return new Promise((resolve, reject) => {
                    if (args.name == null) {
                        artist.model.find((err, artists) => {
                            if (err) reject(err)
                            else resolve(artists)
                        })
                    }
                    else {
                        artist.model.find((err, artists) => {
                            if (err) reject(err)
                            else resolve(artists)
                        }).where('name').equals(args.name)
                    }
                })
            }
        },
        albums: {
            type: new graphql.GraphQLList(album.type),
            args: {
                title: {
                    name: 'title',
                    type: graphql.GraphQLString
                }
            },
            resolve: (root, args) => {
                return new Promise((resolve, reject) => {
                    if (args.title == null) {
                        album.model.find((err, albums) => {
                            if (err) reject(err)
                            else resolve(albums)
                        })
                    }
                    else {
                        album.model.find((err, albums) => {
                            if (err) reject(err)
                            else resolve(albums)
                        }).where('title').equals(args.title)
                    }
                })
            }
        }
    })
});

var mutationType = new graphql.GraphQLObjectType({
    name: 'Mutation',
    fields: {
        artistAdd: artist.add,
        albumAdd: album.add
    }
});

module.exports = new graphql.GraphQLSchema({
    query: query,
    mutation: mutationType
});