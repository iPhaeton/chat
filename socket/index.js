var WebSocketServer = new require("ws");
var socketAuth = require("./socketAuth");

var sockets = {};

module.exports = function (server) {
    var webSocketServer = new WebSocketServer.Server({
        server:server
    });

    webSocketServer.on("connection", function (socket) {
        socketAuth(socket.upgradeReq, function (err, results) {
            var id = Math.random() * Math.random() * Math.random();
            sockets[id] = results;
            sockets[id].socket = socket;

            var username = sockets[id].user.username;

            socket.on("message", function (text) {
                for (var id in sockets) {
                    sockets[id].socket.send(username + "> " + text);
                };
            });

            socket.on("close", function () {
                delete sockets[id];
            })
        });
    });
};

global.sockets = sockets;