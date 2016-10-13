/**
 * Created by Phaeton on 21.05.2016.
 */
var http = require("http");
var route = require("server/router");
var config = require("config");
var log = require("lib/log")(module);

var server;

function run() {
    log.info("Server is running");
    server = http.createServer(function (req, res) {
        route(req, res);
    }).listen(process.env.PORT || config.get("port"), process.env.IP || "0.0.0.0");

    require("../socket")(server);
};

exports.run = run;