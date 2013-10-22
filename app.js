var config = require('./config'),
    cluster = require('cluster'),
    path = require('path'),
    log4js = require('log4js');

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

log4js.replaceConsole();

if (!config.verbose) {

    log4js.setGlobalLogLevel('WARN');
}

config.target.routes.forEach(function(route) {

    router[route.method](route.mask, require(path.join(__dirname, 'handlers', route.handlerName)));
});

server.listen(config.server.port);

process.on('uncaughtException', console.error);