/**
 * Created by Phaeton on 21.05.2016.
 */
var errors = require("errors/errors");
var url = require("url");
var fs = require("fs");
var handleError = require("handlers/errorHandler");
var ejs = require("ejs");

function sendPage(file, parameters) {
    var res = parameters.res;
    var data = "";

    file.on ("readable", function () {
        var nextData = this.read();
        if (nextData) data += nextData;
    });

    file.on ("end", function () {
        var renderedData = ejs.render(data, {body: "<h1>Hello, world!</h1>"});

        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");
        res.end(renderedData);
    });

    file.on ("error", function (error) {
        handleError(new errors.RequestError(404, "File not found: " + file.path), parameters);
    });

    res.on ("close", function () {
        file.destroy();
    });
};

function sendIndex(parameters) {
    var res = parameters.res;
    var index = new fs.ReadStream("templates/index.ejs");

    sendPage(index, parameters);
};

function handleForbiddenURL(parameters) {
    throw new errors.RequestError(401, "Access denied");
};

exports["/"] = sendIndex;
exports["/forbidden"] = handleForbiddenURL;