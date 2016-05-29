/**
 * Created by Phaeton on 29.05.2016.
 */
var mongoose = require("mongoose");
var config = require("config");

mongoose.connect(config.get("mongoose:uri", "isMongooseURI"), config.get("mongoose:options"));

module.exports = mongoose;