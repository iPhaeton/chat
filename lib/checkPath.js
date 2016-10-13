/**
 * Created by Phaeton on 03.06.2016.
 */
var pathMod = require("path");
var fs = require("fs");

var paths = {
    "/public": true,
    "/templates": true
};

module.exports = function (pathname) {
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