var http = require("http");
var log = require("lib/log")(module);
var handle = require("handlers/handler");
var errors = require("errors/errors");

module.exports = function (error, parameters) {
    var res = parameters.res;

    if (typeof error === "number") {
        if (!http.STATUS_CODES[error]) error = 500;

        res.statusCode = error;
        res.end(http.STATUS_CODES[error] || "Error");
        return;
    };

    parameters.statusCode = error.statusCode || 500;
    log.error (error.stack);

    if (error instanceof errors.RequestError) {
        error.send(parameters);
    } else {
        if (process.env.NODE_ENV === "development") {
            handle.file("templates/error.jade", parameters, 
                {message: parameters.statusCode + " " + error.message, 
                 stack: prttifyStack(error.stack)});
        } else {
            error = new errors.RequestError(500);
            error.send();
        };
    };
};

function prttifyStack(str) {
    return str.split("\n").join("<br>");
};