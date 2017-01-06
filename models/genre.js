var graphql = require('graphql');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var schema = new mongoose.Schema({
    label: {
        type: String,
        index: true,
        unique: true
    }
})

var genre = mongoose.model('genre', schema);

var genreType = new graphql.GraphQLObjectType({
    name: 'Genre',
    fields: {
        _id: {
            type: graphql.GraphQLInt
        },
        label: {
            type: graphql.GraphQLString
        }
    }
})

var genreAdd = {
    type: genreType,
    description: 'Add genre',
    args: {
        label: {
            name: 'label',
            type: new graphql.GraphQLNonNull(graphql.GraphQLString)
        },
    },
    resolve: (root, args) => {
        var newGenre = new genre({label: args.label});
        return new Promise((resolve, reject) => {
            newGenre.save(function (err) {
                if (err) 
                    reject(err)
                else 
                    resolve(newGenre)
            })
        })
    }
}

var genreDelete = {
    type: genreType,
    description: 'Add genre',
    args: {
        _id: {
            name: '_id',
            type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
        }
    },
    resolve: (root, args) => {
        return new Promise((resolve, reject) => {
            genre.remove({"_id": args._id}, (function (err, doc) {
                if (err) 
                    reject(err)
                else 
                    resolve(doc)
            }))
        })
    }
}

module.exports = {
    schema: schema,
    model: genre,
    type: genreType,
    add: genreAdd,
    delete: genreDelete
}