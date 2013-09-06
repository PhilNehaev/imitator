var http = require('http'),
    url = require('url'),
    crypto = require('crypto'),
    _ = require('underscore'),
    fs = require('fs'),
    CacheStream = require('./cache_stream'),
    path = require('path'),
    cacheDir = path.join(__dirname, '/cache');

var server = http.createServer(serverHandler);

function serverHandler(req, res) {

    var options = {

            host: 'uat.tcsbank.ru',
            port: 80,
            method: req.method,
            path: url.parse(req.url).path,
            headers: _.extend({}, req.headers, {

                'accept-encoding': ''
            })
        },
        cacheKey = getCacheKey(options),
        imitatorHeaders = {

            'access-control-allow-origin': '*'
        },
        cacheStream = new CacheStream(cacheDir, imitatorHeaders),
        mockPath = getMockPath(options.path);

    options.headers.host = options.host;

    console.log('Incoming request: ' + req.method + ' ' + req.url);
    console.log('  Cache key: ' + cacheKey);

    fs.exists(mockPath, function(isExist) {

        if (isExist) {

            console.log('  Read mock-file from ' + mockPath);
            fs.createReadStream(mockPath).pipe(res);
            return;
        }

        var target = http.request(options, function(targetReq) {

            cacheStream.cacheKey = cacheKey;
            cacheStream.cachePath = cacheStream.getCachePath(cacheKey);
            cacheStream.req = targetReq;
            cacheStream.res = res;
            cacheStream.on('error', responseOnFail);

            targetReq
                .pipe(cacheStream)
                .pipe(res);
        })
            .on('error', responseOnFail)
            .on('timeout', responseOnFail);

        target.setTimeout(2000);

        req.pipe(target);
    });

    function responseOnFail(err) {

        var cachePath = cacheStream.getCachePath(cacheKey);

        res.writeHead(200, imitatorHeaders);

        fs.exists(cachePath, function(isExist) {

            console.log('  ' + err);

            if (isExist) {

                fs.createReadStream(cachePath).pipe(res);
                console.log('  Response from cache');
            } else {

                res.end('{"resultCode":"IMITATOR_CACHE_EMPTY",' +
                    '"errorMessage":"Was not correct response and cache empty"}', 'utf-8');
                console.log('  No cache (on error)');
            }
        });
    }
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

function mkCacheDir() {

    fs.exists(cacheDir, function(isExist) {

        if (!isExist) {

            fs.mkdir(cacheDir, function(err) {

                console.log((err ? 'Error create' : 'Create') + ' directory for cache');
            });
        }
    });
}

function getMockPath(mockPath) {

    var match = mockPath.match(/\/api\/v1\/([a-z_]+)/);

    return path.join(__dirname, "mocks", (match && match[1] || 'default') + '.json');
}

mkCacheDir();

server.timeout = 5000;
server.listen(7000);

server.on('timeout', function(res) {

    res.end('{"resultCode": "IMITATOR_TIMEOUT", "errorMessage": "Was taken a global timeout"}', 'utf-8');
});

process.on('uncaughtException', function(err) {

    console.error('Caught exception: ' + err);
});