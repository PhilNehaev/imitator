module.exports.cacheability = function(data) {

    return data && data.resultCode === "OK" && data.payload && data.payload.userName;
};