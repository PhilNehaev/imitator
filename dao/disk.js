var Base = require('./base'),
    config = require('../config'),
    util = require('util'),
    fs = require('fs'),
    path = require('path');

util.inherits(DiskDAO, Base);

function DiskDAO(collectionName) {

    Base.apply(this, arguments);

    fs.exists(config.dao.disk[collectionName], function(isExist) {

        if (!isExist) {

            fs.mkdir(config.dao.disk[collectionName], function(err) {

                console[err ? error : log]('Create directory for ' + collectionName);
            });
        }
    });
}

DiskDAO.prototype.write = function(key, data, cb) {

    fs.writeFile(this.getPath(key), data, cb);
};

DiskDAO.prototype.read = function(key, cb) {

    var filePath = this.getPath(key);

    fs.exists(filePath, function(isExist) {

        if (isExist) {

            fs.readFile(filePath, {

                encoding: 'utf-8'
            }, cb);

            return;
        }

        cb(true);
    });
};

DiskDAO.prototype.getPath = function(key) {

    return path.join(config.dao.disk[this.collectionName], key + '.' + this.collectionName);
};

module.exports = DiskDAO;