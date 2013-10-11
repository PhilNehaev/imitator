var config = require('./config'),
    cluster = require('cluster'),
    path = require('path');

if (cluster.isMaster) {

    for (var i = 0; i < config.numCPUs; i++) {

        cluster.fork();
        cluster.on('exit', console.error);
    }

    return;
}

var router = require('router')(),
    mockHandler = require('./handlers/mock'),
    server = require('http').createServer(mockHandler(router));

if (!config.verbose) {

    console.trace = console.log = function(){};
}

config.target.routes.forEach(function(route) {

    router[route.method](route.mask, require(path.join(__dirname, 'handlers', route.handlerName)));
});

server.listen(config.server.port);

process.on('uncaughtException', console.error);