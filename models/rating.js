var graphql = require('graphql');
var mongoose = require('mongoose');

var rating = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    rate: {
        type: Number,
        reuired: true,
        min: 1,
        max: 10
    }
}, {_id: false})

var ratingSchemaGraphQL = {
    user_id: {
        type: graphql.GraphQLID
    },
    rate: {
        type: graphql.GraphQLInt
    }
}

var ratingInputType = new graphql.GraphQLInputObjectType({name: '_Rating', fields: ratingSchemaGraphQL})

var ratingOutputType = new graphql.GraphQLObjectType({name: 'Rating', fields: ratingSchemaGraphQL})

module.exports = {
    schema: rating,
    inputType: ratingInputType,
    outputType: ratingOutputType
}