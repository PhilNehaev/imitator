var path = require('path');

module.exports = {

    /**
     * Target it is typically api address
     */
    target: {

        host: 'uat.tcsbank.ru',
        port: 80
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
    }
};