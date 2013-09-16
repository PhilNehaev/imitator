var Base = require('./base'),
    config = require('../config'),
    mongoose = require('mongoose'),
    util = require('util');

var dataSchema = mongoose.Schema({

        key: {

            type: String,
            unique: true,
            required: true
        },

        value: {

            type: String,
            required: true
        }
    });

mongoose.connect(config.dao.mongo.url);

util.inherits(MongoDAO, Base);

function MongoDAO(collectionName) {

    Base.apply(this, arguments);

    this.DataModel = mongoose.model(collectionName, dataSchema);
}

MongoDAO.prototype.write = function(key, data, cb) {

    this.DataModel.findOneAndUpdate({

        key: key
    }, {

        value: data
    }, {

        upsert: true
    }, function(err, model) {

        if (cb) {
            cb(err, model && model.value);
        }
    });
};

MongoDAO.prototype.read = function(key, cb) {

    this.DataModel.findOne({

        key: key
    }, function(err, model) {

        if (cb) {
            cb(err, model && model.value);
        }
    });
};

module.exports = MongoDAO;