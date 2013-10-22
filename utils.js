var config = require('./config'),
    crypto = require('crypto'),
    _ = require('lodash'),
    url = require('url'),
    qs = require('querystring'),
    DAO = require('./dao/mongo');

module.exports = {

    getCacheKey: function(_options, cb) {

        var sessionStorage = new DAO('sid.cache'),
            params = qs.parse(url.parse(_options.path).query) || {},
            options = _.extend({}, _options, {

                path: _options.path
                    .replace(/(&|\?)_=\d+/, '') // ignore jquery no-cache
                    .replace(/(&|\?)sessionid=[\w\d\.\-]+/, '') // ignore sessionid param
                    .replace(/\//g, ''),
                headers: {}
            });

        sessionStorage.read(params.sessionid, function(err, data) {

            options.linkedUsername = data;

            console.debug('  Login: ' + data);
            console.debug('  SID: ' + params.sessionid);

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

        var path = url.parse(req.url).path;

        _.each(config.target.pathReplace, function(replaceTo, regexp) {

            path = path.replace(new RegExp(regexp), replaceTo);
        });

        return {

            host: config.target.host,
            port: config.target.port,
            method: req.method,
            path: path,
            headers: _.extend({}, req.headers, {

                host: config.target.host,
                'accept-encoding': 'deflate'
            })
        };
    }
};