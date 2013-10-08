var utils = require('../utils'),
    http = require('http'),
    buffer = require('buffer').Buffer;

module.exports = function(req, res) {

    var options = utils.getRequestOptions(req),
        target = http.request(options, function(_res) {

            res.writeHead(
                _res.statusCode,
                _res.headers
            );

            _res.pipe(res);
        });

    target.end();
};