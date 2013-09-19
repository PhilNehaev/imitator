var _ = require('lodash');

module.exports.responsebility = function(data) {

    return data && _.isArray(data.payload) && data.payload.length > 2;
};

module.exports.cacheability = module.exports.responsebility;