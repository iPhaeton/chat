/**
 * Created by Phaeton on 21.05.2016.
 */
var util = require("util");
var http = require("http");
var log = require("lib/log")(module);
var handle = require("handlers/handler");

//Request errors
function RequestError (statusCode, message) {
    Error.apply(this, arguments);
    this.statusCode = statusCode;
    this.message = message || http.STATUS_CODES[statusCode] || "Error";
    Error.captureStackTrace(this, RequestError);
};
util.inherits(RequestError, Error);
RequestError.prototype.name = "RequestError";

RequestError.prototype.send = function (parameters) {
    //log.error (this.stack);
    handle.file("templates/error.jade", parameters, {message: this.statusCode + " " + this.message, content: "Sorry, an error occured"});
};

//Authentication errors
function AuthError (message) {
    Error.apply(this, arguments);
    this.message = message;
    Error.captureStackTrace(this, AuthError);
};
util.inherits(AuthError, Error);
AuthError.prototype.name = "AuthError";

//Config errors
function ConfigError (property) {
    Error.apply(this, arguments);
    this.property = property;
    this.message = "Config error";
    Error.captureStackTrace(this, ConfigError);
};
util.inherits(ConfigError, Error);
ConfigError.prototype.name = "ConfigError";

function MissingConfig (property) {
    ConfigError.apply(this, arguments);
    this.message = "Missing property '" + this.property + "' in config file";
};
util.inherits(MissingConfig, ConfigError);
MissingConfig.prototype.name = "MissingConfig";

function WrongConfig (property) {
    ConfigError.apply(this, arguments);
    this.message = "Wrong data for property '" + this.property + "' in config file";
};
util.inherits(WrongConfig, ConfigError);
WrongConfig.prototype.name = "WrongConfig";

//------------------------------------------------------------------------------------------------------------
exports.RequestError = RequestError;
exports.AuthError = AuthError;
exports.MissingConfig = MissingConfig;
exports.WrongConfig = WrongConfig;