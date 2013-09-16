var config = require('./config'),
    route = require('router')(),
    mockHandler = require('./handlers/mock'),
    server = require('http').createServer(mockHandler(function(req, res) {

        console.log('Incoming request: ' + req.method + ' ' + req.url);
        route(req, res);
    }));

route.all('/api/v1/session', require('./handlers/session'));
route.all('*', require('./handlers/default'));

server.timeout = config.server.timeout;
server.listen(config.server.port);

server.on('timeout', function(res) {

    res.end(config.responses[config.target.format].timeout);
});

//process.on('uncaughtException', console.error);