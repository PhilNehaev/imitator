var config = require('../config'),
    utils = require('../utils'),
    DAO = require('../dao'),
    CacheStream = require('../cache_stream');

var cacheStorage = new DAO(config.daoType, 'cache');

function Response(res, options) {

    if (arguments.length < 2) {

        throw new Error('Wrong arguments');
    }

    this.res = res;
    this.options = options;
    this.cacheKey = utils.getCacheKey(options);

    this.onFail = this.onFail.bind(this);
    this.fromCache = this.fromCache.bind(this);
    this.fromTarget = this.fromTarget.bind(this);
}

Response.prototype.onFail = function(err) {

    console.log('  ' + err);
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