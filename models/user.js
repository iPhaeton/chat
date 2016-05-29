/**
 * Created by Phaeton on 28.05.2016.
 */
var crypto = require("crypto");
var mongoose = require("lib/mongoose");

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

exports.User = mongoose.model ("User", schema);