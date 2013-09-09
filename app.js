var config = require('./config'),
    utils = require('./utils'),
    http = require('http'),
    url = require('url'),
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
                'accept-encoding': 'deflate'
            })
        },
        cacheKey = utils.getCacheKey(options),
        mockKey = utils.getMockKey(options.path);

    console.log('Incoming request: ' + req.method + ' ' + req.url);
    console.log('  Cache key: ' + cacheKey);

    mockStorage.read(mockKey, mockHandler);

    function mockHandler(err, data) {

        if (!err && data) {

            console.log('  Read mock-file from ' + mockKey);
            res.end(data);
            return;
        }

        var target = http.request(options, targetHandler)
            .on('error', responseOnFail)
            .on('timeout', responseOnFail);

        target.setTimeout(config.target.timeout);

        req.pipe(target);
    }

    function targetHandler(targetReq) {

        var cacheStream = new CacheStream(cacheStorage, cacheKey, targetReq)
            .on('error', responseOnFail);

        setHeaders(res);

        targetReq
            .pipe(cacheStream)
            .pipe(res);
    }

    function responseOnFail(err) {

        console.log('  ' + err);
        cacheStorage.read(cacheKey, responseFromCache);
    }

    function responseFromCache(err, data) {

        setHeaders(res);

        if (err || !data) {

            res.end(config.responses[config.target.format].error);
            return;
        }

        res.end(data);
        console.log('  Response from cache');
    }

    function setHeaders(res) {

        res.writeHead(200, config.imitationHeaders);
    }
}

server.timeout = config.server.timeout;
server.listen(config.server.port);

server.on('timeout', function(res) {

    res.end(config.responses[config.target.format].timeout);
});

process.on('uncaughtException', console.error);