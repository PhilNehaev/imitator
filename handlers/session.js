var config = require('../config'),
    utils = require('../utils'),
    http = require('http'),
    Response = require('../response'),
    JSONStream = require('JSONStream'),
    es = require('event-stream'),
    DAO = require('../dao/mongo'),
    url = require('url'),
    qs = require('querystring');

module.exports = function sessionHandler(req, res) {

    var sessionStorage = new DAO('sid.cache'),
        options = utils.getRequestOptions(req),
        params = qs.parse(url.parse(req.url).query),
        body = '';

    // get post data
    req.on('data', function(chunk) {

        body += chunk.toString();
    });

    req.on('end', function() {

        utils.getCacheKey(options, function(err, cacheKey) {

            var response = new Response(res, cacheKey, options);

            if (err) {

                response.fromCache(err);
            }

            var target = http.request(options)
                .on('response', function(targetRes) {

                    response
                        .fromTarget(targetRes);

                    // get username from get or post-params
                    body = qs.parse(body);
                    var username = params.username || body.username;

                    if (username) {

                        targetRes
                            .pipe(JSONStream.parse('payload.sessionId'))
                            .pipe(es.mapSync(function (sessionId) {

                                return sessionStorage.write(sessionId, username);
                            }));
                    }
                })
                .on('error', response.onFail)
                .on('timeout', response.onFail);

            target.write(body);
            target.setTimeout(config.target.timeout);

            req.pipe(target);
        }.bind(this));
    });
};