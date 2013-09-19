module.exports.cacheability = function(data) {

    return data && data.payload !== 'ANONYMOUS';
};