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
  // 100 - succesful 200 - not exists 300 - error
  // 301 - username exists
  // 302 - email exists
  var newUser = new User({username: req.body.username, email: req.body.email});

  User.register(newUser, req.body.password, function (err, account) {
    if (err) {
      var status;
      if(err.message.includes('username'))
        status = 301;
      if(err.message.includes('email'))
        status = 302;
      res.send({status: status, name: err.name, message: err.message});
    } else {
      res.send({status: 100, userId: newUser._id, username: newUser.username});
    }
  });
})

app.post('/login', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  // 100 - succesful 200 - not exists 300 - error
  passport.authenticate('local', (err, data) => {
    if (err) {
      res.send({status: 300, name: err.name, message: err.message});
    } else if (!data) {
      res.send({status: 200});
    } else {
      res.send({status: 100, userId: data._doc._id.toString(), username: data._doc.username});
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