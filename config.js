var path = require('path'),
    _ = require('lodash'),
    argv = require('optimist').argv;

module.exports = {

    target: _.extend({

        host: argv.targetHost || '172.16.10.29',
        port: argv.targetPort || 80,
        pathReplace: {},
        format: argv.targetFormat || 'json',
        timeout: argv.targetTimeout || 10000,
        routes: [

            {
                method: 'get',
                mask: '/{apiPath}?/v1/role_verification',
                handlerName: 'role_verification'
            },
            {
                method: 'get',
                mask: '/{apiPath}?/explorer*',
                handlerName: 'pipe'
            },
            {
                method: 'get',
                mask: '*',
                handlerName: 'default'
            },
            {
                method: 'all',
                mask: '*',
                handlerName: 'pipe'
            }
        ]
    }, {

        shared: {

            host: '192.168.16.208',
            port: 8280,
            pathReplace: {

                '^\/api': ''
            }
        }
    }[argv.env]),

    server: {

        port: process.env.PORT || 7000
    },

    dao: {

        disk: {

            cache: path.join(__dirname, 'disk/cache_response'),
            'sid.cache': path.join(__dirname, 'disk/cache_sid'),
            json: path.join(__dirname, 'disk/mocks')
        },

        mongo: _.extend({

            url: argv.mongoUrl || 'mongodb://localhost:27017/imitator',
            ttl: argv.mongoTtl || '7d'
        }, {

            shared: {

                url: 'mongodb://192.168.16.135:27017/imitator'
            }
        }[argv.env])
    },

    headers: {

        json: {

            'Content-Type': 'application/json;charset=UTF-8',
            'Access-Control-Allow-Origin': '*',
            'X-Powered-By': 'imitator'
        }
    },

    responses: {

        json: {

            error: '{"resultCode":"IMITATOR_ERROR"}',
            cacheEmpty: '{"resultCode":"IMITATOR_CACHE_EMPTY",' +
                '"errorMessage":"The server’s response is not correct. The cache is empty."}'
        }
    },

    numCPUs: require('os').cpus().length,

    verbose: !!argv.verbose
};