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
  },
  picture: String,
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
    picture: {
      type: graphql.GraphQLString
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
    picture: {
      name: 'picture',
      type: graphql.GraphQLString
    },
    body: {
      name: 'body',
      type: new graphql.GraphQLNonNull(graphql.GraphQLString)
    }
  },
  resolve: (root, args) => {
    var newPost = new post({
      title: args.title,
      author: args.author,
      picture: args.picture,
      createDate: Date.now(),
      body: args.body
    })
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

var commentAdd = {
  type: comment.outputType,
  description: 'Add comment',
  args: {
    post_id: {
      name: 'post_id',
      type: new graphql.GraphQLNonNull(graphql.GraphQLID)
    },
    author: {
      name: 'author',
      type: new graphql.GraphQLNonNull(graphql.GraphQLID)
    },
    parent_id: {
      name: 'createDate',
      type: graphql.GraphQLID
    },
    body: {
      name: 'body',
      type: new graphql.GraphQLNonNull(graphql.GraphQLString)
    }
  },
  resolve: (root, args) => {
    var newComment = new comment.model({
      author: args.author,
      parent_id: args.parent_id,
      body: args.body,
      createDate: Date.now()
    })

    return new Promise((resolve, reject) => {
      post.findByIdAndUpdate(args.post_id, {
        "$push": {
          "comments": newComment
        }
      }).exec().then(() => {
          post.findById(args.post_id)
            .populate('comments.author')
            .lean()
            .exec(function (err, res) {
              if (err) 
                reject(err)
              else 
                resolve(res.comments[res.comments.length - 1])
            })
        });
    })
  }
}

module.exports = {
  model: post,
  type: postType,
  add: postAdd,
  addComment: commentAdd
}