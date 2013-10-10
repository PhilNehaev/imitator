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

    console.trace = console.log = function(){};
}

route.get('/{apiPath}?/v1/role_verification', require('./handlers/role_verification'));
route.get('/{apiPath}?/explorer*', require('./handlers/pipe'));
route.get('*', require('./handlers/default'));
route.all('*', require('./handlers/pipe'));

server.listen(config.server.port);

process.on('uncaughtException', console.error);