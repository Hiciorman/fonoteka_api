var graphql = require('graphql');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/fonoteka');
mongoose.Promise = require('bluebird');

var person = require('./models/person');
var album = require('./models/album');


var query = new graphql.GraphQLObjectType({
    name: 'query',
    fields: () => ({
        people: {
            type: new graphql.GraphQLList(person.type),
            resolve: () => {
                return new Promise((resolve, reject) => {
                    person.schema.find((err, people) => {
                        if (err) reject(err)
                        else resolve(people)
                    })
                })
            }
        },
        albums: {
            type: new graphql.GraphQLList(album.type),
            resolve: () => {
                return new Promise((resolve, reject) => {
                    album.schema.find((err, albums) => {
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
        personAdd: person.add,
        albumAdd: album.add
    }
});

module.exports = new graphql.GraphQLSchema({
    query: query,
    mutation: mutationType
});