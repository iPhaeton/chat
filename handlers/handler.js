/**
 * Created by Phaeton on 21.05.2016.
 */
var errors = require("errors/errors");
var url = require("url");
var fs = require("fs");
var handleError = require("handlers/errorHandler");
var jade = require("jade");

function sendPage(file, parameters) {
    var res = parameters.res;
    var data = "";

    file.on ("readable", function () {
        var nextData = this.read();
        if (nextData) data += nextData;
    });

    file.on ("end", function () {
        var renderedData = jade.render(data, {basedir: "templates"});

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

function sendFile(file, parameters) {
    var res = parameters.res;
    var data = "";

    file.on ("readable", function () {
        var nextData = this.read();
        if (nextData) data += nextData;
    });

    file.on ("end", function () {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/css");
        res.end(data);
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
    var index = new fs.ReadStream("templates/index.jade");

    sendPage(index, parameters);
};

function handleForbiddenURL(parameters) {
    throw new errors.RequestError(401, "Access denied");
};

exports["/"] = sendIndex;
exports["/forbidden"] = handleForbiddenURL;

//----------------------------------------------------------------------------------------------------
function sendCSS(parameters) {
    var res = parameters.res;
    var index = new fs.ReadStream("templates/layouts/styles.css");

    sendFile(index, parameters);
};

function sendJS(parameters) {
    var res = parameters.res;
    var index = new fs.ReadStream("public/vendor/s.js");

    sendFile(index, parameters);
};

exports["/templates/layouts/styles.css"] = sendCSS;
exports["/public/vendor/s.js"] = sendJS;