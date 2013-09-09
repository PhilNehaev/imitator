var config = require('./config'),
    crypto = require('crypto'),
    extend = require('underscore').extend,
    url = require('url');

module.exports = {

    getCacheKey: function(_input) {

        var input = extend({}, _input, {

            path: _input.path
                .replace(/(&|\?)_=\d+/, '') // ignore jquery no-cache
                .replace(/(&|\?)sessionid=[\w\d\.\-]+/, ''), // ignore sessionid param
            headers: {}
        });

        return crypto
            .createHash('md5')
            .update(JSON.stringify(input))
            .digest('hex');
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