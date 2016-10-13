var handleError = require("handlers/errorHandler");

var mongoose = require("lib/mongoose");

Schema = mongoose.Schema;

var schema = new Schema ({
    cookie: {
        maxAge: {
            type: Number,
            default: null
        },
        httpOnly: {
            type: Boolean,
            default: true
        },
        path: {
            type: String,
            default: "/"
        },
        signed: {
            type: Boolean,
            default: true
        },
        overwrite: {
            type: Boolean,
            default: true
        }
    }, 
    created: Date,
    data: Object

});

schema.methods.writeData = function (property, value) {
    this.set("data."+property, value);
    this.save(function (err) {
        if (err) handleError(err);
    })
};

exports.Session = mongoose.model ("Session", schema);