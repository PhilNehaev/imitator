var config = require('../config'),
    utils = require('../utils'),
    DAO = require('../dao'),
    mockStorage = new DAO(config.daoType, 'json');

module.exports = function(cb) {

    return function(req, res) {

        mockStorage.read(utils.getMockKey(req.url), function(err, data) {

            if (!err && data) {

                console.log('  Response from mock-file');
                res.end(data);
                return;
            }

            cb(req, res);
        });
    };
};