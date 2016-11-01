//maybe later
var graphql = require('graphql');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var label = mongoose.model('label', {
    name: String,
    album_ids: [mongoose.Schema.Types.ObjectId]
});

var labelType = new graphql.GraphQLObjectType({
    name: 'label',
    fields: function () {
        return {
            _id: {
                type: graphql.GraphQLID
            },
            name: {
                type: graphql.GraphQLString
            },
            album_ids: {
                type: new graphql.GraphQLList(graphql.GraphQLID)
            }
        }
    }
});

var queryType = new graphql.GraphQLObjectType({
    name: 'xxx',
    fields: () => ({
        labels: {
            type: new graphql.GraphQLList(labelType),
            resolve: () => {
                return new Promise((resolve, reject) => {
                    label.find((err, labels) => {
                        if (err) reject(err)
                        else resolve(labels)
                    })
                })
            }
        }
    })
})

module.exports = queryType;
