var waterfall = require("lib/waterfall");
var config = require("config");
var cookieParser = require("cookie-parser");
var Cookies = require("cookies");
var errors = require("errors/errors");
var User = require("models/user").User;
var Session = require("models/session").Session;

module.exports = function (upgradeReq, onResult) {
    waterfall([
        function (callback) {
            var cookies = new Cookies(upgradeReq, null, {"keys": [config.get("session:key")]});

            try {
                var id = cookies.get(config.get("session:name"), {signed: true});
            } catch (err) {
                callback(new errors.AuthError("Session not found"));
                return;
            };

            if (id) {
                Session.findById(id, function (err, session) {
                    if (err) {
                        callback(err);
                        return;
                    };

                    if (session) {
                        callback(null,session);
                    };
                });
            };
        },
        function (session, callback) {
            if (!session.data.user){
                callback(new errors.AuthError("User not found"));
                return;
            };

            var uid = session.data.user;
            User.findById(uid, function (err, user) {
                if (err) {
                    callback(err);
                    return;
                };

                if (user) {
                    callback(null, {session: session, user: user});
                };
            })
        }
    ], onResult);
}
