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
        },

        last_update: {

            type: Date,
            expires: config.dao.mongo.ttl
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

        value: data,
        last_update: new Date()
    }, {

        upsert: true
    }, function(err, model) {

        if (err) {
            console.error(err);
        }

        if (cb) {
            cb(err, model && model.value);
        }
    });
};

MongoDAO.prototype.read = function(key, cb) {

    this.DataModel.findOne().or([
        { key: key },
        { value: key }
    ]).exec(function(err, model) {

        if (cb) {
            cb(err, model && model.value);
        }
    });
};

module.exports = MongoDAO;