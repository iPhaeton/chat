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

exports.Session = mongoose.model ("Session", schema);