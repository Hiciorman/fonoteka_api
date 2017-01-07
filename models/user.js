var graphql = require('graphql');
var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
mongoose.Promise = require('bluebird');

var schema = new mongoose.Schema({
    username: {
        type: String,
        index: true,
        unique: true
    },
    password: String,
    email: {
        type: String,
        index: true,
        unique: true
    }
});

schema.plugin(passportLocalMongoose);

var user = mongoose.model('user', schema)

var userFields = {
    _id: {
        type: graphql.GraphQLID
    },
    username: {
        type: graphql.GraphQLString
    },
    email: {
        type: graphql.GraphQLString
    }
}

var userType = new graphql.GraphQLObjectType({name: 'User', fields: userFields})
var userInputType = new graphql.GraphQLInputObjectType({name: '_User', fields: userFields})

module.exports = {
    model: user,
    type: userType,
    inputType: userInputType
}