var graphql = require('graphql');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var album = require('./album');

var author = mongoose.model('author', {
    first_name: String,
    last_name: String,
    birth_date: Date,
    birth_place: String,
    death_date: Date,
    albums: [album.schema]
});

var authorType = new graphql.GraphQLObjectType({
    name: 'Author',
    fields: function () {
        return {
            _id: {
                type: graphql.GraphQLID
            },
            first_name: {
                type: graphql.GraphQLString
            },
            last_name: {
                type: graphql.GraphQLString
            },
            birth_date: {
                type: graphql.GraphQLString
            },
            birth_place: {
                type: graphql.GraphQLString
            },
            death_date: {
                type: graphql.GraphQLString
            },
            albums:{
                type: new graphql.GraphQLList(album.type)
            }
        }
    }
});

var queryType = new graphql.GraphQLObjectType({
    name: 'query',
    fields: () => ({
        authors: {
            type: new graphql.GraphQLList(authorType),
            resolve: () => {
                return new Promise((resolve, reject) => {
                    author.find((err, authors) => {
                        if (err) reject(err)
                        else resolve(authors)
                    })
                })
            }
        }
    })
});

module.exports = queryType;