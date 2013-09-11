var config = require('../config'),
    util = require('util'),
    stream = require('stream'),
    StringDecoder = require('string_decoder').StringDecoder;

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

    if (this.isValid(data)) {

        this._storage.write(this._cacheKey, this._buffer, function(err) {

            console[err ? 'error' : 'log']('  Response write to cache');
        });

        console.log('  Response from target server');
        this.push(this._buffer);
        cb();
    } else {

        this._storage.read(this._cacheKey, function(err, data) {

            this.responseFromCache(err, data);
            cb();
        }.bind(this));
    }
};

CacheStream.prototype.isValid = function(data) {

    return [
        'INVALID_REQUEST_DATA',
        'INTERNAL_ERROR',
        'AUTHENTICATION_FAILED',
        'INSUFFICIENT_PRIVILEGES',
        'REQUEST_RATE_LIMIT_EXCEEDED'
    ].indexOf(data.resultCode) < 0 && this._req.statusCode === 200;
};

CacheStream.prototype.parse = function(data) {

    return JSON.parse(data);
};

CacheStream.prototype.responseFromCache = function(err, data) {

    if (err && !data) {

        this.push(data);
        console.log('  Response from cache');
        return;
    }

    this.push(config.responses[config.target.format].cacheEmpty);
    console.log('  Response not valid and cache empty');
};

module.exports = CacheStream;