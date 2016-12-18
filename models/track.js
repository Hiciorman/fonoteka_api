var graphql = require('graphql');
var mongoose = require('mongoose');

var track = new mongoose.Schema({
  id: Number,
  feat: String,
  title: String,
  length: String
}, {_id: false})

var trackSchemaGraphQL = {
  id: {
    type: graphql.GraphQLInt
  },
  feat: {
    type: graphql.GraphQLString
  },
  title: {
    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
  },
  length: {
    type: graphql.GraphQLString
  }
}

var trackInputType = new graphql.GraphQLInputObjectType({name: '_Track', fields: trackSchemaGraphQL})

var trackOutputType = new graphql.GraphQLObjectType({name: 'Track', fields: trackSchemaGraphQL})

module.exports = {
  schema: track,
  inputType: trackInputType,
  outputType: trackOutputType
}