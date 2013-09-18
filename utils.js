var config = require('./config'),
    crypto = require('crypto'),
    extend = require('lodash').extend,
    url = require('url'),
    qs = require('querystring'),
    DAO = require('./dao/mongo');

module.exports = {

    getCacheKey: function(_options, cb) {

        var sessionStorage = new DAO('sid.cache'),
            params = qs.parse(url.parse(_options.path).query) || {},
            options = extend({}, _options, {

                path: _options.path
                    .replace(/(&|\?)_=\d+/, '') // ignore jquery no-cache
                    .replace(/(&|\?)sessionid=[\w\d\.\-]+/, '') // ignore sessionid param
                    .replace(/\//g, ''),
                headers: {}
            });

        sessionStorage.read(params.sessionid, function(err, data) {

            options.linkedUsername = data;
            console.log('  Login: ' + data);
            console.log('  SID: ' + params.sessionid);

            cb(
                null,
                crypto.createHash('md5')
                    .update(JSON.stringify(options))
                    .digest('hex')
            );
        });
    },

    getMethodName: function(mockPath) {

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