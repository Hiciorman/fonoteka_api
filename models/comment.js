var graphql = require('graphql');
var mongoose = require('mongoose');

var comment = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    parent_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    body: {
        type: String,
        required: true
    },
    createDate: {
        type: Date,
        required: true
    }
})

var commentSchemaGraphQL = {
    _id: {
      type: graphql.GraphQLID
    },
    author: {
        type: graphql.GraphQLID,
        ref: 'User'
    },
    parent_id: {
        type: graphql.GraphQLID,
        ref: 'Comment'
    },
    body: {
        type: graphql.GraphQLString
    },
    createDate: {
      type: graphql.GraphQLString
    }
}

var commentInputType = new graphql.GraphQLInputObjectType({name: '_Comment', fields: commentSchemaGraphQL})

var commentOutputType = new graphql.GraphQLObjectType({name: 'Comment', fields: commentSchemaGraphQL})

module.exports = {
    schema: comment,
    inputType: commentInputType,
    outputType: commentOutputType
}