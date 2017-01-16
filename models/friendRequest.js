var graphql = require('graphql');
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    from: mongoose.Schema.Types.ObjectId,
    to:  mongoose.Schema.Types.ObjectId,
    status: String
})

var friendRequest = mongoose.model('friendRequest', schema);

var friendRequestSchemaGraphQL = {
    _id: {
      type: graphql.GraphQLID
    },
    from: {
        type: new graphql.GraphQLNonNull(graphql.GraphQLID) 
    },
    to: {
        type: new graphql.GraphQLNonNull(graphql.GraphQLID)
    },
    status:{
        type: new graphql.GraphQLNonNull(graphql.GraphQLString)
    }
}

var friendRequestType = new graphql.GraphQLObjectType({name: 'FriendRequest', fields: friendRequestSchemaGraphQL})

var friendRequestAdd = {
  type: friendRequestType,
  description: 'Add friend request',
  args: {
      from:{
          name: 'from',
          type: new graphql.GraphQLNonNull(graphql.GraphQLID)
      },
      to:{
          name: 'to',
          type: new graphql.GraphQLNonNull(graphql.GraphQLID)   
      }
  },
  resolve: (root, args) => {
        var newRequest = new friendRequest({
            from: args.from,
            to: args.to,
            status: 'Created'
        })
        return new Promise((resolve, reject) => {
        newRequest.save(function (err) {
            if (err) 
                reject(err)
            else 
                resolve(newRequest)
            })
        })
  }
}

var friendRequestUpdate = {
  type: friendRequestType,
  description: 'Update friend request',
  args: {
      requestId:{
          name: 'requestId',
          type: new graphql.GraphQLNonNull(graphql.GraphQLID)
      },
      status:{
          name: 'status',
          type: new graphql.GraphQLNonNull(graphql.GraphQLString)   
      }
  },
  resolve: (root, args) => {
    return new Promise((resolve, reject) => {
        friendRequest.findByIdAndUpdate(args.requestId, 
        {"$set": {"status": args.status}},{new:true},
        function (err, doc) {
            if (err) 
                reject(err)
            else 
                resolve(doc)
        })
    })
  }
}

module.exports = {
    schema: schema,
    model: friendRequest,
    type: friendRequestType,
    add: friendRequestAdd,
    update: friendRequestUpdate
}