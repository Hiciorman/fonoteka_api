var graphql = require('graphql');
var mongoose = require('mongoose');
var user = require('./user');

var schema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
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

var comment = mongoose.model('comment', schema);

var commentSchemaGraphQL = {
    _id: {
      type: graphql.GraphQLID
    },
    author: {
        type: user.type
    },
    parent_id: {
        type: graphql.GraphQLID
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
    schema: schema,
    model: comment,
    inputType: commentInputType,
    outputType: commentOutputType
}