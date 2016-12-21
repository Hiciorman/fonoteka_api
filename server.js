var express = require('express');
var graphQLHTTP = require('express-graphql');
// var flash = require('connect-flash');
// var passport = require('passport');
// var Strategy = require('passport-http').BasicStrategy;
var Schema = require('./schema.js');

var app = express();
// app.use(flash());

// passport.use(new Strategy(
//   function(username, password, cb) {
//     db.users.findByUsername(username, function(err, user) {
//       if (err) { return cb(err); }
//       if (!user) { return cb(null, false); }
//       if (user.password != password) { return cb(null, false); }
//       return cb(null, user);
//     });
//   }));

// app.get('/',
//   passport.authenticate('basic', { session: false }),
//   function(req, res) {
//     res.json({ username: req.user.username, email: req.user.emails[0].value });
//   });

app.use('/graphql', graphQLHTTP((req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  return {
    schema: Schema,
    graphiql: true,
  }
}));

app.listen(process.env.PORT || 4000, function (err) {
  console.log('GraphQL Server is now running on localhost:4000');
});