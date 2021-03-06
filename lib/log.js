/**
 * Created by Phaeton on 21.05.2016.
 */
var winston = require("winston");
var ENV = process.env.NODE_ENV;

module.exports = function (module) {
    var path = module.filename.split("\\").slice(-2).join("/");

    return new winston.Logger({
        transports: [
            new winston.transports.Console({
                colorize: true,
                level: (ENV === "development") ? "debug" : "error",
                label: path
            })
        ]
    });
};