var http = require("http");
var log = require("lib/log")(module);
var handle = require("handlers/handler");

module.exports = function (error, parameters) {
    var res = parameters.res;

    if (typeof error === "number") {
        if (!http.STATUS_CODES[error]) error = 500;

        res.statusCode = error;
        res.end(http.STATUS_CODES[error] || "Error");
        return;
    };

    //if (error.statusCode) res.statusCode = error.statusCode;
    parameters.statusCode = error.statusCode;

    if (process.env.NODE_ENV === "development") {
        log.error (error.stack);
        handle.file("templates/error.jade", parameters, {message: error.message, stack: prttifyStack(error.stack)});
    } else {
        log.error(error.stack);
        handle.file("templates/error.jade", parameters, {message: error.message});
    };
};

function prttifyStack(str) {
    return str.split("\n").join("<br>");
};