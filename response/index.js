var config = require('../config'),
    utils = require('../utils'),
    DAO = require('../dao/mongo'),
    CacheStream = require('../cache_stream'),
    _ = require('lodash'),
    Buffer = require('buffer').Buffer,
    es = require('event-stream');

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

    console.log('Incoming request: ' + options.method + ' ' + options.path);
}

Response.prototype.onFail = function(err) {

    console.error('  ' + (err || 'Error ') + this.options.path);
    cacheStorage.read(this.cacheKey, this.fromCache);

    return this;
};

Response.prototype.fromCache = function(err, data) {

    var cacheEmpty = config.responses[config.target.format].cacheEmpty;

    if (err || !data) {

        this.setHeaders({

            'Content-Length': Buffer.byteLength(cacheEmpty)
        });
        this.res.end(cacheEmpty);
        return this;
    }

    this.setHeaders({

        'Content-Length': Buffer.byteLength(data)
    });
    this.res.end(data);

    return this;
};

Response.prototype.fromTarget = function(res) {

    var cacheStream = new CacheStream(cacheStorage, this.cacheKey, res)
        .on('error', this.onFail);

    return res
        .pipe(cacheStream)
        .pipe(es.mapSync(function (data) {

            this.setHeaders({

                'Content-Length': Buffer.byteLength(data)
            });

            return data;
        }.bind(this)))
        .pipe(this.res);
};

Response.prototype.setHeaders = function(customs) {

    this.res.writeHead(
        200,
        _.extend({}, config.headers[config.target.format], customs)
    );

    return this;
};

module.exports = Response;