var config = require('../config'),
    utils = require('../utils'),
    DAO = require('../dao/mongo'),
    CacheStream = require('../cache_stream');

var cacheStorage = new DAO('cache');

function Response(res, cacheKey, options) {

    if (arguments.length < 2) {

        throw new Error('Wrong arguments');
    }

    this.res = res;
    this.cacheKey = cacheKey;
    this.options = options;

    this.onFail = this.onFail.bind(this);
    this.fromCache = this.fromCache.bind(this);
    this.fromTarget = this.fromTarget.bind(this);
}

Response.prototype.onFail = function(err) {

    console.log('  ' + (err || 'Error'));
    cacheStorage.read(this.cacheKey, this.fromCache);

    return this;
};

Response.prototype.fromCache = function(err, data) {

    this.setHeaders();

    if (err || !data) {

        this.res.end(config.responses[config.target.format].error);
        return this;
    }

    this.res.end(data);
    console.log('  Response from cache');

    return this;
};

Response.prototype.fromTarget = function(res) {

    var cacheStream = new CacheStream(cacheStorage, this.cacheKey, res)
        .on('error', this.onFail);

    this.setHeaders();

    return res
        .pipe(cacheStream)
        .pipe(this.res);
};

Response.prototype.setHeaders = function() {

    this.res.writeHead(200, config.imitationHeaders);

    return this;
};

module.exports = Response;