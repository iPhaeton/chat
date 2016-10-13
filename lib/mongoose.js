/**
 * Created by Phaeton on 29.05.2016.
 */
var mongoose = require("mongoose");
var config = require("config");

//mongoose.connect(config.get("mongoose:uri", "isMongooseURI"), config.get("mongoose:options"));
if (process.env.PORT) {
    mongoose.connect (config.get("mongoose:uri"), config.get("mongoose:options"));
} else {
    mongoose.connect ("mongodb://localhost/chat", config.get("mongoose:options"));
};

module.exports = mongoose;