var config = require('./config'),
    cluster = require('cluster');

if (cluster.isMaster) {

    for (var i = 0; i < config.numCPUs; i++) {

        cluster.fork();
        cluster.on('exit', console.error);
    }

    return;
}

var route = require('router')(),
    mockHandler = require('./handlers/mock'),
    server = require('http').createServer(mockHandler(route));

if (!config.verbose) {

    console.log = function(){};
}

route.all('/api/v1/session', require('./handlers/session'));
route.all('*', require('./handlers/default'));

server.timeout = config.server.timeout;
server.listen(config.server.port);

server.on('timeout', function(res) {

    res.end(config.responses[config.target.format].timeout);
});

process.on('uncaughtException', console.error);