var config = require('../config'),
    fs = require('fs'),
    path = require('path');

function DAO(type, collectionName) {

    this.collectionName = collectionName;

    fs.exists(config.dao.disk[collectionName], function(isExist) {

        if (!isExist) {

            fs.mkdir(config.dao.disk[collectionName], function(err) {

                console.log((err ? 'Error create' : 'Create') + ' directory for ' + collectionName);
            });
        }
    });
}

DAO.prototype.write = function(key, data, cb) {

    fs.writeFile(this.getPath(key), data, cb);
};

DAO.prototype.read = function(key, cb) {

    var filePath = this.getPath(key);

    fs.exists(filePath, function(isExist) {

        if (isExist) {

            fs.readFile(filePath, cb);
            return;
        }

        cb(true, 'File ' + filePath + ' not found');
    });
};

DAO.prototype.getPath = function(key) {

    return path.join(config.dao.disk[this.collectionName], key + '.' + this.collectionName);
};

module.exports = DAO;