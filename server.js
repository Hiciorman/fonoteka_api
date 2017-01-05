var express = require('express');
var bodyParser = require('body-parser')
var graphQLHTTP = require('express-graphql');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var Schema = require('./schema.js');
var User = require('./models/user').model;
var WebAppUrl = 'http://localhost:5000';
var app = express();
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.post('/register', function (req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  User.register(new User({username: req.body.username}), req.body.password, function (err, account) {
    if (err) {
      res
        .status(500)
        .send({name: err.name, message: err.message});
    } else {
      passport.authenticate('local')(req, res, function () {
        res.sendStatus(200);
      });
    }
  });
})

app.post('/login', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');

  passport.authenticate('local', (err, data) => {
    if (err) {
      res
        .status(500)
        .send({name: err.name, message: err.message});
    }
    else{
      res
        .status(200)
        .send({userId: data._doc._id.toString()});
    }
  })(req, res, next);
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/graphql', graphQLHTTP((req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  return {schema: Schema, graphiql: true}
}));

app.listen(process.env.PORT || 4000, function (err) {
  console.log('GraphQL Server is now running on localhost:4000');
});