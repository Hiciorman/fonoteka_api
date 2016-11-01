var graphql = require('graphql');

var track = {
      id: Number,
      feat: String,
      title: String,
      length: String
};

var trackType = new graphql.GraphQLObjectType({
  name: "Track",
  fields: function () {
    return {
      id: {
        type: graphql.GraphQLInt
      },
      feat: {
        type: graphql.GraphQLString
      },
      title: {
        type: graphql.GraphQLString
      },
      length: {
        type: graphql.GraphQLString
      }
    }
  }
});

module.exports = {
    schema: track,
    type: trackType
};