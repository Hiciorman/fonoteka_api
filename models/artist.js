var graphql = require('graphql');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var artist = mongoose.model('artist', {
    name: String,
    realName: String,
    description: String,
    // members: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'artist'
    // }], // if band
    // bands: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'artist'
    // }], // if person
    albums: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'album'
    }]    //photos: TODO:Add photos
})

var artistType = new graphql.GraphQLObjectType({
    name: 'Artist',
    fields: {
        _id: {
            type: graphql.GraphQLID
        },
        name: {
            type: graphql.GraphQLString
        },
        realName: {
            type: graphql.GraphQLString
        },
        description: {
            type: graphql.GraphQLString
        },
        // members: {
        //     type: new graphql.GraphQLList(graphql.GraphQLID)
        // },
        // bands: {
        //     type: new graphql.GraphQLList(graphql.GraphQLID)
        // },
        albums: {
            type: new graphql.GraphQLList(graphql.GraphQLID)
        }
    }
})

var artistAdd = {
    type: artistType,
    description: 'Add artist',
    args: {
        name: {
            name: 'name',
            type: new graphql.GraphQLNonNull(graphql.GraphQLString)
        },
        realName: {
            name: 'realName',
            type: graphql.GraphQLString
        },
        description: {
            name: 'description',
            type: graphql.GraphQLString
        },
        // members: {
        //     name: 'members',
        //     type: new graphql.GraphQLList(graphql.GraphQLID)
        // },
        // bands: {
        //     name: 'bands',
        //     type: new graphql.GraphQLList(graphql.GraphQLID)
        // }
    },
    resolve: (root, args) => {
        var newArtist = new artist({
            name: args.name,
            realName: args.realName,
            description: args.description,
            // members: args.members,
            // bands: args.bands
        })
        return new Promise((resolve, reject) => {
            newArtist
                .save(function (err) {
                    if (err) 
                        reject(err)
                    else 
                        resolve(newArtist)
                })
        })
    }
}

var artistEdit = {
    type: artistType,
    description: 'Edit artist',
    args: {
        _id: {
            name: "_id",
            type: new graphql.GraphQLNonNull(graphql.GraphQLID)
        },
        name: {
            name: 'name',
            type: new graphql.GraphQLNonNull(graphql.GraphQLString)
        },
        realName: {
            name: 'realName',
            type: new graphql.GraphQLNonNull(graphql.GraphQLString)
        },
        description: {
            name: 'description',
            type: graphql.GraphQLString
        },
        // members: {
        //     name: 'members',
        //     type: new graphql.GraphQLList(graphql.GraphQLID)
        // },
        // bands: {
        //     name: 'bands',
        //     type: new graphql.GraphQLList(graphql.GraphQLID)
        // }
    },
    resolve: (root, args) => {
        return new Promise((resolve, reject) => {
            artist
                .findOneAndUpdate({
                    "_id": args._id
                }, {
                    "$set": {
                        "name": args.name,
                        "realName": args.realName,
                        "description": args.description,
                        // "members": args.members,
                        // "bands": args.bands
                    }
                }, function (err, doc) {
                    if (err) 
                        reject(err);
                    
                    resolve(args);
                })
        })
    }
}

var artistDelete = {
    type: artistType,
    description: 'Delete artist',
    args: {
        _id: {
            name: '_id',
            type: new graphql.GraphQLNonNull(graphql.GraphQLID)
        }
    },
    resolve: (root, args) => {
        return new Promise((resolve, reject) => {
            artist
                .remove({
                    "_id": args._id
                }, function (err, doc) {
                    if (err) 
                        reject(err);
                    
                    resolve(args);
                })
        })
    }
}

module.exports = {
    model: artist,
    type: artistType,
    add: artistAdd,
    edit: artistEdit,
    delete: artistDelete
}