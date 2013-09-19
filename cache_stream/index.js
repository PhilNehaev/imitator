var config = require('../config'),
    util = require('util'),
    stream = require('stream'),
    _ = require('lodash'),
    StringDecoder = require('string_decoder').StringDecoder,
    getMethodName = require('../utils').getMethodName;

util.inherits(CacheStream, stream.Transform);

function CacheStream(storage, cacheKey, req) {

    this._storage = storage;
    this._cacheKey = cacheKey;
    this._req = req;

    stream.Transform.call(this);

    this._writableState.objectMode = false;
    this._readableState.objectMode = true;
    this._buffer = '';
    this._decoder = new StringDecoder('utf8');
}

CacheStream.prototype._transform = function(chunk, encoding, cb) {

    this._buffer += this._decoder.write(chunk);
    cb();
};

CacheStream.prototype._flush = function(cb) {

    var data = this._buffer.trim();

    try {

        data = this.parse(data);
    } catch (err) {

        this.emit('error', 'Parse error: ' + err);
        return;
    }

    if (this.isResponsebility(data)) {

        if (this.isCacheability(data)){

            this._storage.write(this._cacheKey, this._buffer, function(err) {

                console[err ? 'error' : 'log']('  Response write to cache. Key: ' + this._cacheKey);
            }.bind(this));
        }

        this.push(this._buffer);
        cb();
    } else {

        this._storage.read(this._cacheKey, function(err, cacheData) {

            this.responseFromCache(err, cacheData, data);
            cb();
        }.bind(this));
    }
};

CacheStream.prototype.validator = function(data, defaultPolitics, validatorName) {

    var customPolitics = true;

    try {
        var validator = require('./validators/' + getMethodName(this._req.req.path))[validatorName];
        customPolitics = validator(data);

    } catch(e) {
    }

    return defaultPolitics && customPolitics;
};

CacheStream.prototype.isResponsebility = function(data) {

    return this.validator(data, this._req.statusCode === 200, 'responsebility');
};

CacheStream.prototype.isCacheability = function(data) {

    return this.validator(data, [
        'INVALID_REQUEST_DATA', 'INTERNAL_ERROR', 'AUTHENTICATION_FAILED',
        'INSUFFICIENT_PRIVILEGES', 'REQUEST_RATE_LIMIT_EXCEEDED'
    ].indexOf(data.resultCode) < 0, 'cacheability');
};

CacheStream.prototype.parse = function(data) {

    return JSON.parse(data);
};

CacheStream.prototype.responseFromCache = function(err, data, origData) {

    if (!err && data) {

        this.push(data);
        console.log('  Response from cache');
        return;
    }

    this.push(config.responses[config.target.format].cacheEmpty);
    console.log('  Response not valid and cache empty');
};

module.exports = CacheStream;