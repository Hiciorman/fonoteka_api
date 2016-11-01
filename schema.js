var graphql = require ('graphql');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/fonoteka');

var root = require('./models/author.js');


module.exports = new graphql.GraphQLSchema({
    query: root.query,
    mutation: root.mutation
});