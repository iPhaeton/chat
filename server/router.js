/**
 * Created by Phaeton on 21.05.2016.
 */
var handle = require("handlers/handler");
var handleError = require("handlers/errorHandler")
var url = require("url");
var log = require("lib/log")(module);
var pathMod = require("path");
var fs = require("fs");

var paths = {
    "/public": true,
    "/templates": true
};

module.exports = function (req, res) {
    var reqParsed = url.parse(req.url);
    var pathname = reqParsed.pathname;
    var pathnameParsed = "/" + pathname.split("/")[1];

    log.debug(req.method + " " + pathname);

    if (handle[pathname] instanceof Function) {
        var parameters = {
            req: req,
            res: res
        };
        try{
            handle[pathname](parameters);
        }
        catch (error) {
            handleError(error, parameters);
        };
    }
    else if (handle[pathnameParsed] instanceof Function) {
        var parameters = {
            req: req,
            res: res
        };
        try{
            handle[pathnameParsed](pathname, parameters);
        }
        catch (error) {
            handleError(error, parameters);
        };
    }
    else if (pathname = checkPath(pathname)) {
        var parameters = {
            req: req,
            res: res
        };
        handle.file(pathname, parameters);
    }
    else {
        res.statusCode = 400;
        res.end ("Bad request");
    };
};

function checkPath (pathname) {
    //decode pathname
    try {
        pathname = decodeURIComponent(pathname);
    }
    catch (e) {
        return false;
    };

    //check for zero byte the in request
    if (~pathname.indexOf("\0")) return false;

    //gather full path
    pathname = pathMod.normalize(pathMod.join(__dirname + "/..", pathname));

    for (var path in paths) {
        //find the path among the allowed paths
        if (pathname.indexOf(pathMod.join(__dirname + "/..", path)) === 0) {
            //check, if the file exists and is a file
            var statCorrect = true;
            fs.stat (pathname, function (err, stats) {
                if (err || !stats.isFile()) {
                    statCorrect = false;
                }
            });
            
            if (statCorrect) return pathname;
            else return false;
        };
    };

    return false;
};