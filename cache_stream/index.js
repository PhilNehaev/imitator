var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    _ = require('underscore'),
    stream = require('stream'),
    StringDecoder = require('string_decoder').StringDecoder;

util.inherits(CacheStream, stream.Transform);

function CacheStream(cacheDir, imitatorHeaders, key, res) {

    stream.Transform.call(this);
    this._writableState.objectMode = false;
    this._readableState.objectMode = true;
    this._buffer = '';
    this._decoder = new StringDecoder('utf8');
    this.res = res;
    this.cacheKey = key;
    this.cacheDir = cacheDir;
    this.cachePath = this.getCachePath(this.cacheKey);
    this.imitatorHeaders = imitatorHeaders;
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

        fs.writeFile(this.cachePath, this._buffer, function(err) {

            console[err ? 'error' : 'log']('  Response write to cache');
        });

        console.log('  Response from source');
        this.res.writeHead(200, this.req.headers);
        this.push(this._buffer);
        cb();
    } else {

        fs.exists(this.cachePath, function(isExist) {

            console.log('  Cache: ' + isExist);

            if (isExist) {

                fs.readFile(this.cachePath, function(err, data) {

                    this.push(data);
                    cb();
                    console.log('  Response from cache');
                }.bind(this));
            } else {

                this.res.writeHead(200, this.imitatorHeaders);
                this.push('{"resultCode":"IMITATOR_CACHE_EMPTY",' +
                    '"errorMessage":"Response was not is valid and cache empty"}');
                cb();
                console.log('  Not valid');
            }
        }.bind(this));
    }
};

CacheStream.prototype.getCachePath = function(cacheKey) {

    return path.join(this.cacheDir, cacheKey + '.cache');
};

CacheStream.prototype.isValidResponse = function(data) {

    return _.indexOf(['INVALID_REQUEST_DATA', 'INTERNAL_ERROR', 'INSUFFICIENT_PRIVILEGES'], data.resultCode) < 0
        && this.req.statusCode === 200;
};

module.exports = CacheStream;