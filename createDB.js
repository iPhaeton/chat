/**
 * Created by Phaeton on 29.05.2016.
 */
var mongoose = require("lib/mongoose");
var User = require("models/user").User;

mongoose.connection.on("open", function () {
    console.log("Database is ready");

    var db = mongoose.connection.db;
    db.dropDatabase();

    var alice = new User ({
        username: "Alice",
        password: "111"
    });
    alice.save(function (err) {
        console.log(alice);
        mongoose.disconnect();
    })
});