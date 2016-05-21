/**
 * Created by Phaeton on 21.05.2016.
 */
var errors = require("errors/errors");

function handleEmptyURL(parameters) {
    var res = parameters.res;
    res.end ("Hello");
};

function handleForbiddenURL(parameters) {
    throw new errors.RequestError(401, "Access denied");
};

exports["/"] = handleEmptyURL;
exports["/forbidden"] = handleForbiddenURL;