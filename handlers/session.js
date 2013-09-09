var config = require('../config'),
    utils = require('../utils'),
    http = require('http'),
    Response = require('../response');

module.exports = function sessionHandler(req, res) {

    var options = utils.getRequestOptions(req),
        response = new Response(res, options);

    var target = http.request(options, function(targetRes) {

            response
                .fromTarget(targetRes)
//                .pipe(saveSessionId);
        })
        .on('error', response.onFail)
        .on('timeout', response.onFail);

    target.setTimeout(config.target.timeout);

    req.pipe(target);
};

function saveSessionId(res) {

}