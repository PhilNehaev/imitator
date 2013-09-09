var path = require('path');

module.exports = {

    /**
     * Target it is typically api address
     */
    target: {

        host: '172.16.10.29',
        port: 80,
        format: 'json'
    },

    server: {

        timeout: 5000,
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

        'access-control-allow-origin': '*'
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