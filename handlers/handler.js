var errors = require("errors/errors");
var handleError = require("handlers/errorHandler");
var url = require("url");
var fs = require("fs");
var jade = require("jade");
var User = require("models/user").User;
var checkPath = require("lib/checkPath");
var ObjectID = require("mongodb").ObjectID;

function sendFile(path, parameters, outputOptions) {
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
        if (ext === "jade") {
            if (!outputOptions) {
                outputOptions = {basedir: "templates"}
            } else {
                outputOptions.basedir = "templates"
            };
            data = jade.render(data, outputOptions);
        };

        res.statusCode = parameters.statusCode || 200;
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
    sendFile("templates/index.jade", parameters, {});
};

function handleForbiddenURL(parameters) {
    throw new errors.RequestError(401, "Access denied");
};

//---------------------------------------------------------------------------------------------------------------
function findUsers(parameters) {
    if (!(parameters instanceof Object)) throw new errors.RequestError(400, "Bad request");

    var res = parameters.res;

    User.find({}, function (err, users) {
        if (err) handleError(err, parameters);

        res.end(prettifyJson(users));
    });
};

function findUser (path, parameters) {
    var res = parameters.res;
    try {
        var id = new ObjectID(path.split(":")[1]);
    } catch (err) {
        handleError(new errors.RequestError(404, "User not found. Wrong ID"), parameters);
        return;
    };

    User.findById(id, function (err, user) {
        if (err) handleError(err, parameters);
        else if (!user) handleError(new errors.RequestError(404, "User not found"), parameters);
        else res.end(prettifyJson(user));
    });
};

function prettifyJson (obj) {
    try {
        var str = JSON.stringify(obj);
    } catch (err) {
        handleError(err);
    };

    str = str.split(",");
    for (var i = 0; i < str.length; i++) {
        str[i] += ",\n";
    };
    str = str.join("");

    str = str.split("},");
    for (var i = 0; i < str.length; i++) {
        str[i] += "},\n";
    };
    return str.join("").slice(0, -5);
};

//-------------------------------------------------------------------------------------------------------
exports["/"] = sendIndex;
exports["/forbidden"] = handleForbiddenURL;
exports["/users"] = findUsers;
exports["/user"]  = findUser;

exports.file = sendFile;