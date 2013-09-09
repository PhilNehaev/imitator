var path = require('path'),
    argv = require('optimist').argv;

module.exports = {

    /**
     * Target it is typically api address
     */
    target: {

        host: argv.targetHost || '172.16.10.29',
        port: argv.targetPort || 80,
        format: argv.targetFormat || 'json',
        timeout: argv.targetTimeout || 2000
    },

    server: {

        timeout: argv.serverTimeout || 5000,
        port: process.env.PORT || 7000
    },

    daoType: 'disk',

    dao: {

        disk: {

            cache: path.join(__dirname, 'disk/cache'),
            json: path.join(__dirname, 'disk/mocks')
        }
    },

    imitationHeaders: {

        'access-control-allow-origin': '*',
        'x-powered-by': 'imitator'
    },

    responses: {

        json: {

            error: '{"resultCode":"IMITATOR_ERROR"}',
            cacheEmpty: '{"resultCode":"IMITATOR_CACHE_EMPTY",' +
                '"errorMessage":"Response was not is valid and cache empty"}',
            timeout: '{"resultCode": "IMITATOR_ERROR",' +
                '"errorMessage": "Was taken a global timeout"}'
        }
    }
};