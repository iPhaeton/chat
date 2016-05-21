/**
 * Created by Phaeton on 21.05.2016.
 */
var http = require("http");
var route = require("./router");

function connect() {
    console.log("Server is running");
    var server = http.createServer(function (req, res) {
        route(req, res);
    }).listen(3000);
};

exports.connect = connect;