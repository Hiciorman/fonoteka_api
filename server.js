var express = require('express');  
var graphQLHTTP = require('express-graphql'); 
var Schema = require('./schema.js');

var app = express();
app.use('/graphql', graphQLHTTP({ 
    schema: Schema, 
    graphiql: true,
   }));
  app.listen(4000, function (err) {
    console.log('GraphQL Server is now running on localhost:4000');
  });