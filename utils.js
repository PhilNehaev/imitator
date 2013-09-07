var crypto = require('crypto'),
    extend = require('underscore').extend;

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
    }
};