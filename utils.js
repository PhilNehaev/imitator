var config = require('./config'),
    crypto = require('crypto'),
    extend = require('lodash').extend,
    url = require('url'),
    qs = require('querystring'),
    DAO = require('./dao');

var sessionStorage = new DAO(config.daoType, 'sid.cache');

module.exports = {

    getCacheKey: function(_options, cb) {

        var params = qs.parse(url.parse(_options.path).query) || {},
            options = extend({}, _options, {

                path: _options.path
                    .replace(/(&|\?)_=\d+/, '') // ignore jquery no-cache
                    .replace(/(&|\?)sessionid=[\w\d\.\-]+/, ''), // ignore sessionid param
                headers: {}
            });

        sessionStorage.read(params.sessionid, function(err, data) {

            options.linkedUsername = data;

            console.log(data);

            cb(
                null,
                crypto.createHash('md5')
                    .update(JSON.stringify(options))
                    .digest('hex')
            );
        });
    },

    getMockKey: function(mockPath) {

        var match = mockPath.match(/\/api\/v1\/([a-z_]+)/);

        return match && match[1];
    },

    getRequestOptions: function(req) {

        return {

            host: config.target.host,
            port: config.target.port,
            method: req.method,
            path: url.parse(req.url).path,
            headers: extend({}, req.headers, {

                host: config.host,
                'accept-encoding': 'deflate'
            })
        };
    }
};