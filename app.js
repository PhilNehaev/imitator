var http = require('http'),
    url = require('url'),
    crypto = require('crypto'),
    _ = require('underscore'),
    fs = require('fs'),
    CacheStream = require('./cache_stream');

var server = http.createServer(serverHandler);

function serverHandler(req, res) {

    var options = {

            host: '172.16.10.29',
            port: 80,
            method: req.method,
            path: url.parse(req.url).path,
            headers: _.extend({}, req.headers, {

                'accept-encoding': ''
            })
        },
        cacheKey = getCacheKey(options),
        cacheStream = new CacheStream,
        resHeaders = {

            'access-control-allow-origin': '*',
            'content-length': undefined
        };

    console.log('Incoming request: ' + req.method + ' ' + req.url);
    console.log('  Cache key: ' + cacheKey);

    var target = http.request(options, function(targetRes) {

            cacheStream.cacheKey = cacheKey;
            cacheStream.cachePath = cacheStream.getCachePath(cacheKey);
            cacheStream.res = targetRes;
            cacheStream.on('error', console.log);

            res.writeHead(200, _.extend({}, targetRes.headers, resHeaders));

            targetRes
                .pipe(cacheStream)
                .pipe(res);
        }).on('error', function(err) {

            var cachePath = cacheStream.getCachePath(cacheKey);

            res.writeHead(200, resHeaders);

            fs.exists(cachePath, function(isExist) {

                console.log('  ' + err);

                if (isExist) {

                    fs.createReadStream(cachePath).pipe(res);
                    console.log('  Response from cache');
                } else {

                    res.end('{"resultCode": "CACHE_EMPTY"}', 'utf-8');
                    console.log('  No cache');
                }
            });
        });

    req.pipe(target);
}

function getCacheKey(_input) {

    var input = _.extend({}, _input, {

        path: _input.path
            .replace(/(&|\?)_=\d+/, '') // ignore jquery no-cache
            .replace(/(&|\?)sessionid=[\w\d\.\-]+/, ''),
        headers: {}
    });

    return crypto
        .createHash('md5')
        .update(JSON.stringify(input))
        .digest('hex');
}

server.listen(7000);

process.on('uncaughtException', function(err) {

    console.error('Caught exception: ' + err);
});