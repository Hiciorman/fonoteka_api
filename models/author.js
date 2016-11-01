// import {
//   GraphQLObjectType,
//   GraphQLSchema
// } from 'graphql';

var graphql = require('graphql');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var album = require('./album');

var author = mongoose.model('author', {
    name: {
        first: String,
        last: String
    },
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
            first: {
                type: graphql.GraphQLString,
                resolve(obj) {
                    return obj.name.first
                }
            },
            last: {
                type: graphql.GraphQLString,
                resolve(obj) {
                    return obj.name.last;
                }
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
            albums: {
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

var authorAdd = {
    type: authorType,
    description: 'Add author',
    args: {
        first: {
            name: 'first',
            type: new graphql.GraphQLNonNull(graphql.GraphQLString)
        },
        last: {
            name: 'last',
            type: new graphql.GraphQLNonNull(graphql.GraphQLString)
        },
        birth_date: {
            name: 'birth_date',
            type: graphql.GraphQLString
        },
        birth_place: {
            name: 'birth_place',
            type: graphql.GraphQLString
        },
        death_date: {
            name: 'death_date',
            type: graphql.GraphQLString
        }
    },
    resolve: (root, args) => {
        var newAuthor = new author({
            name: {
                first: args.first,
                last: args.last,
            },
            birth_date: args.birth_date,
            birth_place: args.birth_place,
            death_date: args.death_date
        })
        return new Promise((resolve, reject) => {
            newAuthor.save(function (err) {
                if (err) reject(err)
                else resolve(newAuthor)
            })
        })
    }
}

// var albumAdd = {
//     type: album.type,
//     description: 'Add album',
//     args: {
//       title: {
//         name: '',
//         type: graphql.GraphQLString
//       },
//       author_id: {
//         name: 'author_id',
//         type: graphql.GraphQLID
//       },
//       released: {
//         name: 'released',
//         type: graphql.GraphQLString
//       },
//       length: {
//         name: 'length',
//         type: graphql.GraphQLString
//       },
//       genres: {
//         name: 'genres',
//         type: new graphql.GraphQLList(graphql.GraphQLString)
//       }
//     },
//     resolve: (root, args) => {
//         var newAlbum = new album({
//             title: args.title,
//             author_id: args.author_id,
//             released: args.released,
//             length: args.length,
//             genres: args.genres
//         })
//         return new Promise((resolve, reject) => {
//             newAlbum.save(function (err) {
//                 if (err) reject(err)
//                 else resolve(newAuthor)
//             })
//         })
//     }
// }

var MutationType = new graphql.GraphQLObjectType({
    name: 'Mutation',
    fields: {
        authorAdd: authorAdd,
        // albumAdd: album.albumAdd
    }
});


module.exports = {
    query: queryType,
    mutation: MutationType
};