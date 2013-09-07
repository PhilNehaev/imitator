var config = require('../config'),
    util = require('util'),
    stream = require('stream'),
    StringDecoder = require('string_decoder').StringDecoder;

util.inherits(CacheStream, stream.Transform);

function CacheStream(storage, cacheKey, res) {

    this.storage = storage;
    this.cacheKey = cacheKey;

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

    var rem = this._buffer.trim(),
        data = {};

    if (!rem) {

        return;
    }

    try {

        data = JSON.parse(rem);
    } catch (er) {

        this.emit('error', 'JSON.parse error: ' + er);
        return;
    }

    if (this.isValidResponse(data)) {

        this.storage.write(this.cacheKey, this._buffer, function(err) {

            console[err ? 'error' : 'log']('  Response write to cache');
        });

        console.log('  Response from source');
        this.push(this._buffer);
        cb();
    } else {

        this.storage.read(this.cacheKey, function(err, data) {

            var isExist = !err && data;

            console.log('  Cache: ' + isExist);

            if (!isExist) {

                this.push('{"resultCode":"IMITATOR_CACHE_EMPTY",' +
                    '"errorMessage":"Response was not is valid and cache empty"}');
                cb();
                console.log('  Not valid');
                return;
            }

            this.push(data);
            cb();
            console.log('  Response from cache');
        }.bind(this));
    }
};

CacheStream.prototype.isValidResponse = function(data) {

    return ['INVALID_REQUEST_DATA', 'INTERNAL_ERROR', 'INSUFFICIENT_PRIVILEGES'].indexOf(data.resultCode) < 0 &&
        this.req.statusCode === 200;
};

module.exports = CacheStream;