var graphql = require('graphql');

var track = {
  id: Number,
  feat: String,
  title: String,
  length: String
}

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

var trackInputType = new graphql.GraphQLInputObjectType({
  name: '_Track',
  fields: trackSchemaGraphQL
})

var trackOutputType = new graphql.GraphQLObjectType({
  name: 'Track',
  fields: trackSchemaGraphQL

})

module.exports = {
  schema: track,
  inputType: trackInputType,
  outputType: trackOutputType
}