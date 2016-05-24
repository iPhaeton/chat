/**
 * Created by Phaeton on 21.05.2016.
 */
var handle = require("handlers/handler");
var handleError = require("handlers/errorHandler")
var url = require("url");
var log = require("lib/log")(module);

module.exports = function (req, res) {
    var reqParsed = url.parse(req.url);
    var pathname = reqParsed.pathname;
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
    else {
        res.statusCode = 400;
        res.end ("Bad request");
    };
};