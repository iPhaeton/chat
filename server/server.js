/**
 * Created by Phaeton on 21.05.2016.
 */
var http = require("http");
var route = require("server/router");
var config = require("config");
var log = require("lib/log")(module);

function run() {
    log.info("Server is running");
    var server = http.createServer(function (req, res) {
        route(req, res);
    }).listen(config.get("port", "isNumeric"));
};

exports.run = run;