var config = require('./config'),
    http = require('http'),
    url = require('url'),
    crypto = require('crypto'),
    extend = require('underscore').extend,
    CacheStream = require('./cache_stream'),
    DAO = require('./dao');

var server = http.createServer(serverHandler),
    cacheStorage = new DAO(config.daoType, 'cache'),
    mockStorage = new DAO(config.daoType, 'json');

function serverHandler(req, res) {

    var options = {

            host: config.target.host,
            port: config.target.port,
            method: req.method,
            path: url.parse(req.url).path,
            headers: extend({}, req.headers, {

                host: config.host,
                'accept-encoding': ''
            })
        },
        cacheKey = getCacheKey(options),
        mockKey = getMockKey(options.path),
        cacheStream = new CacheStream(cacheStorage, cacheKey);

    console.log('Incoming request: ' + req.method + ' ' + req.url);
    console.log('  Cache key: ' + cacheKey);

    mockStorage.read(mockKey, function(err, data) {

        if (!err && data) {

            console.log('  Read mock-file from ' + mockKey);
            res.end(data);
            return;
        }

        var target = http.request(options, function(targetReq) {

                cacheStream.req = targetReq;
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

        console.log('  ' + err);

        res.writeHead(200, config.imitationHeaders);

        cacheStorage.read(cacheKey, function(err, data) {

            if (err || !data) {

                res.end('{"resultCode":"IMITATOR_ERROR"}', 'utf-8');
                return;
            }

            res.end(data);
            console.log('  Response from cache');
        });
    }
}

function getCacheKey(_input) {

    var input = extend({}, _input, {

        path: _input.path
            .replace(/(&|\?)_=\d+/, '') // ignore jquery no-cache
            .replace(/(&|\?)sessionid=[\w\d\.\-]+/, ''), // ignore sessionid param
        headers: {}
    });

    return crypto
        .createHash('md5')
        .update(JSON.stringify(input))
        .digest('hex');
}

function getMockKey(mockPath) {

    var match = mockPath.match(/\/api\/v1\/([a-z_]+)/);

    return match && match[1];
}

server.timeout = 5000;
server.listen(7000);

server.on('timeout', function(res) {

    res.end('{"resultCode": "IMITATOR_ERROR", "errorMessage": "Was taken a global timeout"}', 'utf-8');
});

process.on('uncaughtException', console.error);