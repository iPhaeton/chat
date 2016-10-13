var errors = require("errors/errors");
var handleError = require("handlers/errorHandler");
var url = require("url");
var fs = require("fs");
var jade = require("jade");
var User = require("models/user").User;
var Session = require("models/session").Session;
var checkPath = require("lib/checkPath");
var ObjectID = require("mongodb").ObjectID;
var Cookies = require("cookies");
var config = require("config");
var waterfall = require("lib/waterfall");
var http = require("http");
var path = require("path");

function sendFile(path, parameters, outputOptions) {
    var file = new fs.ReadStream(path);
    var res = parameters.res;
    var data = "";
    var ext = getExtention(path);
    var type = getType(ext);

    file.on ("readable", function () {
        var nextData = this.read();
        if (nextData) data += nextData;
    });

    file.on ("end", function () {
        if (ext === "jade") {
            if (!outputOptions) {
                outputOptions = {basedir: "templates"}
            } else {
                outputOptions.basedir = "templates"
            };
            data = jade.render(data, outputOptions);
        };

        res.statusCode = parameters.statusCode || 200;
        res.setHeader("Content-Type", type);
        res.end(data);
    });

    file.on ("error", function (error) {
        handleError(new errors.RequestError(404, "File not found: " + file.path), parameters);
    });

    res.on ("close", function () {
        file.destroy();
    });
};

function getExtention (path) {
    var arr = path.split(".");
    return arr[arr.length - 1];
};

function getType (ext) {
    switch (ext) {
        case "jade":
            return "text/html";
        case "css":
            return "text/css";
        case "js":
            return "text/javascript";
        default:
            return "text/plain";
    };
};

function sendIndex(parameters) {
    var req = parameters.req;

    sendFile(path.resolve(__dirname, "../templates/index.jade"), parameters, {user: req.user});
};

function sendLoginPage(parameters) {
    var req = parameters.req;

    if (req.method === "GET") sendFile(path.resolve(__dirname, "../templates/login.jade"), parameters, {user: req.user});
    else if (req.method === "POST") authorize(parameters);
}

function sendChatPage(parameters) {
    var req = parameters.req;

    if (!req.session.data || !req.session.data.user) {
        handleError(new errors.RequestError(401, "You are not authorized"), parameters);
        return;
    }

    sendFile(path.resolve(__dirname, "../templates/chat.jade"), parameters, {user: req.user});
};

function logout(parameters) {
    var req = parameters.req,
        res = parameters.res;

    if(req.method !== "POST") {
        res.end();
        return;
    };

    var sid = req.session._id;

    Session.remove({_id: sid}, function (err) {
        if (err) {
            handleError(err);
            return;
        };
        res.end();

        for (var id in sockets) {
            if (sid.id === sockets[id].session._id.id) {
                sockets[id].socket.close();
            };
        };
    });
};

function handleForbiddenURL(parameters) {
    throw new errors.RequestError(401, "Access denied");
};

//axillaries------------------------------------------------------------------------------------------------
function findUsers(parameters) {
    if (!(parameters instanceof Object)) throw new errors.RequestError(400, "Bad request");

    var res = parameters.res;

    User.find({}, function (err, users) {
        if (err) handleError(err, parameters);

        res.end(prettifyJson(users));
    });
};

function findUser (path, parameters) {
    var res = parameters.res;
    try {
        var id = new ObjectID(path.split(":")[1]);
    } catch (err) {
        handleError(new errors.RequestError(404, "User not found. Wrong ID"), parameters);
        return;
    };

    User.findById(id, function (err, user) {
        if (err) handleError(err, parameters);
        else if (!user) handleError(new errors.RequestError(404, "User not found"), parameters);
        else res.end(prettifyJson(user));
    });
};

function prettifyJson (obj) {
    try {
        var str = JSON.stringify(obj);
    } catch (err) {
        handleError(err);
    };

    str = str.split(",");
    for (var i = 0; i < str.length; i++) {
        str[i] += ",\n";
    };
    str = str.join("");

    str = str.split("},");
    for (var i = 0; i < str.length; i++) {
        str[i] += "},\n";
    };
    return str.join("").slice(0, -5);
};

function parsePost(url) {
    url = url.split("&");

    var obj = {};

    url.forEach(function (item) {
        item = item.split("=");
        obj[item[0]] = item[1];
    });

    return obj;
};

//Authorization----------------------------------------------------------------------------------------------------
function authorize (parameters) {
    var req = parameters.req,
        res = parameters.res,
        body = "";

    req.on("data", function (chunk) {
        body += chunk;
    });

    req.on("end", function () {
        var request = parsePost(body);
        User.authorize(request.username, request.password, function (err, user) {
            if (err) {
                if (err instanceof errors.AuthError) {
                    handleError(new errors.RequestError(403, err.message), parameters);
                } else {
                    handleError(err, parameters);
                }
                return;
            };
            req.session.writeData("user", user._id);
            res.end();
        });
    });

    req.on("error", function () {
        handleError(500, parameters);
    })
};

//Sessions----------------------------------------------------------------------------------------
function sessionHandler(parameters, resolve, reject) {
    var req = parameters.req,
        res = parameters.res;

    var cookies = new Cookies(req, res, {"keys": [config.get("session:key")]});

    try {
        var id = cookies.get(config.get("session:name"), {signed: true});
    } catch (err) {
        var id = undefined;
    };

    if (id) {
        Session.findById(id, function (err, session) {
            if (err) {
                reject(err);
                return;
            };

            if (session) {
                req.session = session;
                resolve();
            }
            else {
                createSession(cookies, parameters, resolve, reject);
            }
        });
    } else {
        createSession(cookies, parameters, resolve, reject);
    };
};

function createSession(cookies, parameters, resolve, reject) {
    var res = parameters.res,
        req = parameters.req;

    var session = new Session({
        data: {},
        created: new Date()
    });

    session.save(function (err) {
        if (err) {
            reject(err);
        };
        
        cookies.set(config.get("session:name"), session._id, config.get("session:cookie"));
        req.session = session;
        resolve();
    });
};

//-------------------------------------------------------------------------------------------------------
exports["/"] = sendIndex;
exports["/login"] = sendLoginPage;
exports["/chat"] = sendChatPage;
exports["/logout"] = logout;
exports["/forbidden"] = handleForbiddenURL;
exports["/users"] = findUsers;
exports["/user"]  = findUser;

exports.session = sessionHandler;

exports.file = sendFile;