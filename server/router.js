/**
 * Created by Phaeton on 21.05.2016.
 */
var handle = require("handlers/handler");
var handleError = require("handlers/errorHandler")
var url = require("url");

module.exports = function (req, res) {
    var pathname = url.parse(req.url).pathname;

    console.log (pathname);
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