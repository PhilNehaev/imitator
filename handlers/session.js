var config = require('../config'),
    utils = require('../utils'),
    http = require('http'),
    Response = require('../response'),
    JSONStream = require('JSONStream'),
    es = require('event-stream'),
    DAO = require('../dao'),
    url = require('url'),
    qs = require('querystring');

var sessionStorage = new DAO(config.daoType, 'sid.cache');

module.exports = function sessionHandler(req, res) {

    var options = utils.getRequestOptions(req),
        params = qs.parse(url.parse(req.url).query);

    utils.getCacheKey(options, function(err, cacheKey) {

        var response = new Response(res, cacheKey, options);

        if (err) {

            response.fromCache(err);
        }

        var target = http.request(options, function(targetRes) {

            response
                .fromTarget(targetRes);

            if (params.username) {

                targetRes
                    .pipe(JSONStream.parse('payload.sessionId'))
                    .pipe(es.mapSync(function (sessionId) {

                        return sessionStorage.write(sessionId, params.username);
                    }));
            }
        })
            .on('error', response.onFail)
            .on('timeout', response.onFail);

        target.setTimeout(config.target.timeout);

        req.pipe(target);
    }.bind(this));
};