var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    _ = require('underscore'),
    stream = require('stream'),
    StringDecoder = require('string_decoder').StringDecoder;

util.inherits(CacheStream, stream.Transform);

function CacheStream(key, res) {

    stream.Transform.call(this);
    this._writableState.objectMode = false;
    this._readableState.objectMode = true;
    this._buffer = '';
    this._decoder = new StringDecoder('utf8');
    this.res = res;
    this.cacheKey = key;
    this.cachePath = this.getCachePath(this.cacheKey);
}

CacheStream.prototype._transform = function(chunk, encoding, cb) {

    this._buffer += this._decoder.write(chunk);
    cb();
};

CacheStream.prototype._flush = function(cb) {

    var rem = this._buffer.trim(),
        data = {};

    if (rem) {

        try {

            data = JSON.parse(rem);
        } catch (er) {

            this.emit('error', er);
            return;
        }

        if (this.isValidResponse(data)) {

            fs.writeFile(this.cachePath, this._buffer, function(err) {

                console[err ? 'error' : 'log']('  Response write to cache');
            });

            console.log('  Response from source');
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

                    this.push('{"resultCode":"NOT_VALID"}');
                    cb();
                    console.log('  Not valid');
                }
            }.bind(this));
        }
    }
};

CacheStream.prototype.getCachePath = function(cacheKey) {

    return path.join('cache', cacheKey + '.cache');
};

CacheStream.prototype.isValidResponse = function(data) {

    return data.resultCode !== 'INTERNAL_ERROR' && this.res.statusCode === 200;
};

module.exports = CacheStream;