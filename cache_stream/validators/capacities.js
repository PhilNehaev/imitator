var _ = require('lodash');

module.exports = function(data) {

    return data && _.isArray(data) && data.length > 2;
};