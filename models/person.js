var graphql = require('graphql');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var person = mongoose.model('person', {
    name: {
        first: String,
        last: String
    },
    birth_date: Date,
    birth_place: String,
    death_date: Date,
    albums: [mongoose.Schema.Types.ObjectId]
})

var personType = new graphql.GraphQLObjectType({
    name: 'Person',
    fields: {
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
                return obj.name.last
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
            type: new graphql.GraphQLList(graphql.GraphQLID)
        }
    }
})

var personAdd = {
    type: personType,
    description: 'Add person',
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
        },
        albums: {
            name: 'albums',
            type: new graphql.GraphQLList(graphql.GraphQLID)
        }
    },
    resolve: (root, args) => {
        var newPerson = new person({
            name: {
                first: args.first,
                last: args.last,
            },
            birth_date: args.birth_date,
            birth_place: args.birth_place,
            death_date: args.death_date,
            albums: args.albums
        })
        return new Promise((resolve, reject) => {
            newPerson.save(function (err) {
                if (err) reject(err)
                else resolve(newPerson)
            })
        })
    }
}

module.exports = {
    schema: person,
    type: personType,
    add: personAdd
}