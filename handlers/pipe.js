var utils = require('../utils'),
    http = require('http');

module.exports = function(req, res) {

    var options = utils.getRequestOptions(req),
        _req = http.request(options, function(_res) {

            res.writeHead(_res.statusCode, _res.headers);

            _res.pipe(res);
        });

    req.pipe(_req);
};