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
var User = require("models/user").User;

//var checkDB = true;

module.exports = function /*route */(req, res) {
    var reqParsed = url.parse(req.url);
    var pathname = reqParsed.pathname;
    var pathnameParsed = "/" + pathname.split("/")[1];
    var filePath;

    log.debug(req.method + " " + pathname);

    var parameters = {
        req: req,
        res: res
    };

    var waitForSession = new Promise((resolve, reject) => {
        "use strict";
        handle.session(parameters, resolve, reject);
    });

    waitForSession.then(result => {
        "use strict";
        var waitForUser = new Promise((resolve, reject) => {
            req.user = null;

            if (!req.session.data) resolve();
            if (!req.session.data.user) resolve();

            User.findById(req.session.data.user, function (err, user) {
                if (err) {
                    reject(err);
                    return;
                };
                req.user = user;
                resolve();
            });
        });

        waitForUser.then(result => {
            "use strict";
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
            //pass only files, which were asked for by a page
            else if (handle[pathnameParsed] instanceof Function && (filePath = checkPath(extractFilePath(pathname, pathnameParsed))) ||
                (filePath = checkPath(pathname))) {
                handle.file(filePath, parameters);
            }
            else {
                handleError(new errors.RequestError(400), parameters);
            };
        },
        error => {
            handleError(error, parameters);
        });
    },
    error => {
        handleError(error, parameters);
    });
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

//exports.route = route;