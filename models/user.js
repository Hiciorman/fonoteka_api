var graphql = require('graphql');
var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var userSchema = mongoose.Schema({
    nick: String,
    name: {
        first: String,
        last: String
    },
    // local: {
    //     email: String,
    //     password: String,
    // },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    created: {
        type: Date,
        default: Date.now
    }
})

// methods ======================
// generating a hash
// userSchema.methods.generateHash = function (password) {
//     return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
// };

// // checking if password is valid
// userSchema.methods.validPassword = function (password) {
//     return bcrypt.compareSync(password, this.local.password);
// };


var userType = new graphql.GraphQLObjectType({
    name: 'User',
    fields: {
        _id: {
            type: graphql.GraphQLID
        },
        nick: {
            type: graphql.GraphQLString
        },
        first: {
            type: graphql.GraphQLString,
            resolve(obj) {
                return obj.name.first
            }
        },
        last: {
            type: graphql.GraphQLString,
            resolve(obj) {
                return obj.name.last
            }
        },
        // email: {
        //     type: graphql.GraphQLString
        // },
        // passwordHash: {
        //     type: graphql.GraphQLString
        // },
        // passwordSalt: {
        //     type: graphql.GraphQLString
        // },
        lastLogin: {
            type: graphql.GraphQLString
        },
        created: {
            type: graphql.GraphQLString
        }
    }
})

module.exports = {
    model: mongoose.model('user', userSchema),
    type: userType
}