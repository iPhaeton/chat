/**
 * Created by Phaeton on 21.05.2016.
 */
var http = require("http");
var route = require("server/router");
var config = require("config");
var log = require("lib/log")(module);
var WebSocketServer = new require("ws");

var sockets = {};

function run() {
    log.info("Server is running");
    var server = http.createServer(function (req, res) {
        route(req, res);
    }).listen(config.get("port", "isNumeric"));
};

var webSocketServer = new WebSocketServer.Server({
    port: 8081
});

webSocketServer.on("connection", function (socket) {
    var id = Math.random() * Math.random() * Math.random();
    sockets[id] = socket;

    socket.on("message", function (text) {
        for (var id in sockets) {
            sockets[id].send(text);
        };
    });
    
    socket.on("close", function () {
        delete sockets[id];
    })
});

exports.run = run;