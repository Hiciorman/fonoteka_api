var graphql = require('graphql');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var comment = require('./comment');
var user = require('./user');

var schema = new mongoose.Schema({
  title: String,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'user'
  }, //picture: String,
  createDate: Date,
  body: String,
  likes: [mongoose.Schema.Types.ObjectId],
  comments: [comment.schema]
})

var post = mongoose.model('post', schema);

var postType = new graphql.GraphQLObjectType({
  name: 'Post',
  fields: {
    _id: {
      type: graphql.GraphQLID
    },
    title: {
      type: graphql.GraphQLString
    },
    author: {
      type: user.type
    },
    createDate: {
      type: graphql.GraphQLString
    },
    body: {
      type: graphql.GraphQLString
    },
    likes: {
      type: new graphql.GraphQLList(graphql.GraphQLID)
    },
    comments: {
      type: new graphql.GraphQLList(comment.outputType)
    }
  }
})

var postAdd = {
  type: postType,
  description: 'Add post',
  args: {
    title: {
      name: 'title',
      type: new graphql.GraphQLNonNull(graphql.GraphQLString)
    },
    author: {
      name: 'author',
      type: new graphql.GraphQLNonNull(graphql.GraphQLID)
    },
    createDate: {
      name: 'createDate',
      type: new graphql.GraphQLNonNull(graphql.GraphQLString)
    },
    body: {
      name: 'body',
      type: new graphql.GraphQLNonNull(graphql.GraphQLString)
    }
  },
  resolve: (root, args) => {
    var newPost = new post({title: args.title, author: args.author, createDate: args.createDate, body: args.body})
    return new Promise((resolve, reject) => {
      newPost
        .save(function (err) {
          if (err) 
            reject(err)
          else 
            resolve(newPost)
        })
    })
  }
}

module.exports = {
  model: post,
  type: postType,
  add: postAdd
}