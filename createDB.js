/**
 * Created by Phaeton on 29.05.2016.
 */
var mongoose = require("lib/mongoose");
var User = require("models/user").User;
var log = require("lib/log")(module);

function open () {
	return new Promise ((resolve, reject) => {
		mongoose.connection.on("open", resolve);
	});
};

function dropDataBase () {
	return new Promise ((resolve, reject) => {
		var db = mongoose.connection.db;
		db.dropDatabase(err => {
			if (err) reject(err);
			resolve();
		});
	});
};

function requireModels () {
	return new Promise ((resolve, reject) => {
		var modelsInProgress = 0;
		require ("models/user");
		
		for (var model in mongoose.models) {
			modelsInProgress++;
			mongoose.models[model].ensureIndexes(err => {
				if (err) reject(err);
				modelsInProgress--;
				if (!modelsInProgress) resolve();
			});
		};
	});
};

function createUsers () {
	var users = [
        {username: "Alice", password: "111"},
        {username: "Alice", password: "222"},
        {username: "Mark", password: "333"}
    ];
	
	return new Promise ((resolve, reject) => {
		var usersInProgress = 0;
		
		users.forEach (userData => {
			usersInProgress++;
			var user = new mongoose.models.User(userData);
			user.save(err => {
				if (err) log.error(err.message);
				usersInProgress--;
				if (!usersInProgress) resolve();
			});
		});
	})
};

function* createDB () {
	yield open();
	yield dropDataBase();
    yield requireModels();
	yield createUsers();
	
	mongoose.disconnect(err => log.info("Connection closed"));
};

function execute (generator, yieldValue) {
	var nextPromise = generator.next(yieldValue).value;
	
	if (nextPromise) {
		nextPromise.then(result => execute(generator, result), error => {
			log.error(error.message);
			mongoose.disconnect(err => log.info("Connection closed"));
		});
	};
};

execute (createDB());