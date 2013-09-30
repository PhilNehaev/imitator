var config = require('../config'),
    utils = require('../utils'),
    http = require('http'),
    Response = require('../response'),
    JSONStream = require('JSONStream'),
    es = require('event-stream'),
    DAO = require('../dao/mongo'),
    url = require('url'),
    qs = require('querystring');

module.exports = function defaultHandler(req, res) {

    var sessionStorage = new DAO('sid.cache'),
        options = utils.getRequestOptions(req),
        params = qs.parse(url.parse(req.url).query);

    utils.getCacheKey(options, function(err, cacheKey) {

        var response = new Response(res, cacheKey, options);

        if (err) {

            response.fromCache(err);
            return;
        }

        var target = http.request(options, response.fromTarget)
            .on('response', function(targetRes) {

                targetRes
                    .pipe(JSONStream.parse('payload.userName'))
                    .pipe(es.mapSync(function (username) {

                        return sessionStorage.write(params.sessionid, username);
                    }));
            })
            .on('error', response.onFail)
            .on('timeout', response.onFail);

        target.setTimeout(config.target.timeout);

        req.pipe(target);
    });
};