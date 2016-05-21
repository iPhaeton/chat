/**
 * Created by Phaeton on 21.05.2016.
 */
var util = require("util");

function RequestError (statusCode, message) {
    this.statusCode = statusCode;
    this.message = message;
    Error.captureStackTrace(this, RequestError);
};
util.inherits(RequestError, Error);
RequestError.prototype.name = "RequestError";

exports.RequestError = RequestError;