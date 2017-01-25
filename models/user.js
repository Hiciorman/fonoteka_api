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
    firstName: String,
    lastName: String,
    description: String,
    birthDate: Date,
    password: String,
    email: {
        type: String,
        index: true,
        unique: true
    },
    friends:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }]
});

schema.plugin(passportLocalMongoose);

var user = mongoose.model('user', schema)

var friendType = new graphql.GraphQLObjectType(
    {
        name: 'friend',
        fields:{
            _id: {
                type: graphql.GraphQLID
            },
            username: {
                type: graphql.GraphQLString
            }
        }
    }
)

var userFields = {
    _id: {
        type: graphql.GraphQLID
    },
    username: {
        type: graphql.GraphQLString
    },
    firstName: {
        type: graphql.GraphQLString
    },
    lastName: {
        type: graphql.GraphQLString
    },
    description: {
        type: graphql.GraphQLString
    },
    birthDate: {
        type: graphql.GraphQLString
    },
    email: {
        type: graphql.GraphQLString
    },
    friends:{
        type: new graphql.GraphQLList(friendType)
    }
}

var userType = new graphql.GraphQLObjectType({name: 'User', fields: userFields})
var userInputType = new graphql.GraphQLInputObjectType({name: '_User', fields: userFields})

var userEdit = {
  type: userType,
  description: 'Edit user',
  args: {
    _id: {
      name: '_id',
      type: new graphql.GraphQLNonNull(graphql.GraphQLID)
    },
    firstName: {
      name: 'firstName',
      type: graphql.GraphQLString
    },
    lastName: {
      name: 'lastName',
      type: graphql.GraphQLString
    },
    description: {
      name: 'description',
      type: graphql.GraphQLString
    },
    birthDate: {
      name: 'birthDate',
      type: graphql.GraphQLString
    }
  },
  resolve: (root, args) => {
    return new Promise((resolve, reject) => {
      user.findOneAndUpdate({
          "_id": args._id
        }, {
          "$set": {
            "firstName": args.firstName,
            "lastName": args.lastName,
            "description": args.description,
            "birthDate": args.birthDate
          }
        }, function (err, doc) {
          if (err) 
            reject(err);
          resolve(args);
        })
    })
  }
}

var userFriendAdd = {
  type: friendType,
  description: 'Add user friend',
  args: {
      userId:{
          name: 'userId',
          type: new graphql.GraphQLNonNull(graphql.GraphQLID)
      },
      friendId:{
          name: 'friendId',
          type: new graphql.GraphQLNonNull(graphql.GraphQLID)   
      }
  },
  resolve: (root, args) => {
    return new Promise((resolve, reject) => {
      user.findByIdAndUpdate(args.userId, {
          "$push": {"friends": args.friendId}
        }).exec().then(()=>{
            user.findByIdAndUpdate(args.friendId, {
                "$push": {"friends": args.userId}
            }, function (err) {
                if (err) 
                    reject(err)
                else 
                    resolve({_id: args.friendId})
                })
            })
        })
    }
}


module.exports = {
    model: user,
    type: userType,
    inputType: userInputType,
    edit: userEdit,
    addFriend: userFriendAdd
}