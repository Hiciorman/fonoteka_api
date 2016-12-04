var graphql = require('graphql');
var mongoose = require('mongoose');

var rating = {
    user_id: mongoose.Schema.Types.ObjectId,
    rate: Number
}

var ratingSchemaGraphQL = {
    _id: {
        type: graphql.GraphQLID
    },
    user_id: {
        type: graphql.GraphQLID
    },
    rate: {
        type: graphql.GraphQLInt
    }
}

var ratingInputType = new graphql.GraphQLInputObjectType({
    name: '_Rating',
    fields: ratingSchemaGraphQL
})

var ratingOutputType = new graphql.GraphQLObjectType({
    name: 'Rating',
    fields: ratingSchemaGraphQL
})

module.exports = {
    schema: rating,
    inputType: ratingInputType,
    outputType: ratingOutputType
}