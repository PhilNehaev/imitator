var path = require('path');

module.exports = {

    /**
     * Target it is typically api address
     */
    target: {

        host: 'uat.tcsbank.ru',
        port: 80
    },

    server: {

        timeout: 5000,
        port: process.env.PORT || 7000
    },

    daoType: 'disk',

    targetFormat: 'json',

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