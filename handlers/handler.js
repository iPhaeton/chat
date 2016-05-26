/**
 * Created by Phaeton on 21.05.2016.
 */
var errors = require("errors/errors");
var url = require("url");
var fs = require("fs");
var handleError = require("handlers/errorHandler");
var jade = require("jade");

function sendFile(path, parameters) {
    var file = new fs.ReadStream(path);
    var res = parameters.res;
    var data = "";
    var ext = getExtention(path);
    var type = getType(ext);

    file.on ("readable", function () {
        var nextData = this.read();
        if (nextData) data += nextData;
    });

    file.on ("end", function () {
        if (ext === "jade") data = jade.render(data, {basedir: "templates"});

        res.statusCode = 200;
        res.setHeader("Content-Type", type);
        res.end(data);
    });

    file.on ("error", function (error) {
        handleError(new errors.RequestError(404, "File not found: " + file.path), parameters);
    });

    res.on ("close", function () {
        file.destroy();
    });
};

function getExtention (path) {
    var arr = path.split(".");
    return arr[arr.length - 1];
};

function getType (ext) {
    switch (ext) {
        case "jade":
            return "text/html";
        case "css":
            return "text/css";
        case "js":
            return "text/javascript";
        default:
            return "text/plain";
    };
};

function sendIndex(parameters) {
    sendFile("templates/index.jade", parameters);
};

function handleForbiddenURL(parameters) {
    throw new errors.RequestError(401, "Access denied");
};

exports["/"] = sendIndex;
exports["/forbidden"] = handleForbiddenURL;

exports.file = sendFile;