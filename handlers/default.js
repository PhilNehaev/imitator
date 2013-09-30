var config = require('../config'),
    utils = require('../utils'),
    http = require('http'),
    Response = require('../response');

module.exports = function defaultHandler(req, res) {

    var options = utils.getRequestOptions(req);

    utils.getCacheKey(options, function(err, cacheKey) {

        var response = new Response(res, cacheKey, options);

        if (err) {

            response.fromCache(err);
            return;
        }

        var target = http.request(options, response.fromTarget)
            .on('error', response.onFail)
            .on('timeout', response.onFail);

        target.setTimeout(config.target.timeout);

        req.pipe(target);
    });
};