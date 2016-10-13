/**
 * Created by Phaeton on 28.05.2016.
 */
var crypto = require("crypto");
var mongoose = require("lib/mongoose");
var waterfall = require("lib/waterfall");
var errors = require("errors/errors");

Schema = mongoose.Schema;

var schema = new Schema ({
    username: {
        type: String,
        unique: true,
        required: true
    },
    hashedPassword: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

schema.methods.encryptPassword = function (password) {
    return crypto.createHmac("sha256", this.salt).update(password).digest("hex");
};

schema.virtual("password")
    .set(function (password) {
        this.salt = Math.random() + "";
        this.hashedPassword = this.encryptPassword(password);
    });

schema.methods.checkPassword = function (password) {
    return this.encryptPassword(password ) === this.hashedPassword;
};

schema.statics.authorize = function (username, password, onResult) {
    var User = this;

    waterfall([
        function (callback) {
            User.findOne({username: username}, callback);
        },
        function (user, callback) {
            if(user){
                if(user.checkPassword(password)) {
                    callback(null, user);
                } else {
                    callback(new errors.AuthError("Wrong login or password"));
                }
            } else {
                callback(new errors.AuthError("Wrong login or password"));
            };
        }
    ], onResult);
};

schema.statics.signup = function (username, password, onResult) {
    var User = this;

    waterfall([
        function (callback) {
            User.findOne({username: username}, callback);
        },
        function (user, callback) {
            if(user){
                callback(new errors.AuthError("This user already exists"));
            } else {
                var user = new User ({username: username, password: password});
                user.save (function (err) {
                    if (err) callback(err);
                    else callback(null, user);
                });
            };
        }
    ], onResult);
};


exports.User = mongoose.model ("User", schema);