var config = require('../config'),
    utils = require('../utils'),
    http = require('http'),
    Response = require('../response');

module.exports = function defaultHandler(req, res) {

    var options = utils.getRequestOptions(req),
        response = new Response(res, options);

    var target = http.request(options, response.fromTarget)
        .on('error', response.onFail)
        .on('timeout', response.onFail);

    target.setTimeout(config.target.timeout);

    req.pipe(target);
};