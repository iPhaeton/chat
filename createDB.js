/**
 * Created by Phaeton on 29.05.2016.
 */
var mongoose = require("lib/mongoose");
var User = require("models/user").User;

function open () {
	return new Promise ((resolve, reject) => {
		mongoose.connection.on("open", resolve);
	});
};

function dropDataBase () {
	return new Promise ((resolve, reject) => {
		var db = mongoose.connection.db;
		db.dropDatabase(resolve);
	});
};

function requireModels () {
	return new Promise ((resolve, reject) => {
		var modelsQuantity = 0;
		require ("models/user");
		
		for (var model in mongoose.models) {
			modelsInProgress++;
			mongoose.models[model].ensureIndexes(() => {
				modelsInProgress--;
				if (!modelsInProgress) resolve();
			});
		};
	});
};

function createUsers () {
	var users = [
        {username: "Alice", password: "111"},
        {username: "Phil", password: "222"},
        {username: "Mark", password: "333"},
    ];
	
	return new Promise ((resolve, reject) => {
		var usersInProgress = 0
		
		users.forEach (userData => {
			usersInProgress++;
			var user = new mongoose.models.User(userData);
			user.save(err => {
				usersInProgress--;
				if (!usersInProgress) resolve();
			});
		});
	})
};

function* createDB () {
	yield open();
	yield dropDataBase();
	yield createUsers();
	
	mongoose.disconnect(err => console.log(err.message));
};

function execute (generator, yieldValue) {
	var nextPromise = generator.next().value;
	
	if (nextPromise) {
		nextPromise.then(result => generator.next(result), error => console.log(error.message));
	};
};

execute (createDB());

/*mongoose.connection.on("open", function () {
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
});*/