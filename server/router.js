/**
 * Created by Phaeton on 21.05.2016.
 */
var errors = require("errors/errors");
var handle = require("handlers/handler");
var handleError = require("handlers/errorHandler");
var url = require("url");
var log = require("lib/log")(module);
var checkPath = require("lib/checkPath");
var mongoose = require("lib/mongoose");

//var checkDB = true;

module.exports = function (req, res) {
    var reqParsed = url.parse(req.url);
    var pathname = reqParsed.pathname;
    var pathnameParsed = "/" + pathname.split("/")[1];
    var filePath;

    log.debug(req.method + " " + pathname);

    var parameters = {
        req: req,
        res: res
    };

    if (handle[pathname] instanceof Function) {
        try{
            handle[pathname](parameters);
        }
        catch (error) {
            handleError(error, parameters);
        };
    }
    else if (~pathname.indexOf(":") && handle[pathnameParsed] instanceof Function) {
        try{
            handle[pathnameParsed](pathname, parameters);
        }
        catch (error) {
            handleError(error, parameters);
        };
    }
    else if (handle[pathnameParsed] instanceof Function && (filePath = checkPath(extractFilePath(pathname, pathnameParsed))) ||
        (filePath = checkPath(pathname))) {
        handle.file(filePath, parameters);
    }
    else {
        handleError(new errors.RequestError(400), parameters);
    };
};

function extractFilePath(path, reqStr) {
    return path.slice(reqStr.length);
};

//delete old sessions
setTimeout(function () {
    mongoose.models.Session.find({}, function (err, sessions) {
        if (err) {
            handleError(err);
            return;
        };

        var currentDate = new Date();

        sessions.forEach (function (session) {
            if (currentDate - session.created > 1209600000) { //two weeks
                mongoose.models.Session.remove ({_id: session._id}, function (err) {
                    if (err) return handleError(err);
                });
            }
        })
    });
}, 300000);