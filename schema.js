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
            resolve: () => {
                return new Promise((resolve, reject) => {
                    user.model.find((err, artists) => {
                        if (err) reject(err)
                        else resolve(artists)
                    })
                })
            }
        },
        artists: {
            type: new graphql.GraphQLList(artist.type),
            resolve: () => {
                return new Promise((resolve, reject) => {
                    artist.model.find((err, artists) => {
                        if (err) reject(err)
                        else resolve(artists)
                    })
                })
            }
        },
        albums: {
            type: new graphql.GraphQLList(album.type),
            resolve: () => {
                return new Promise((resolve, reject) => {
                    album.model.find((err, albums) => {
                        if (err) reject(err)
                        else resolve(albums)
                    })
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