function execute (generator, finalCallback, yieldValue) {
    var nextPromise = generator.next(yieldValue).value;

    if (nextPromise instanceof Promise) {
        nextPromise.then(result => execute(generator, finalCallback,  result), error => {
            finalCallback(error);
        });
    } else {
        finalCallback.apply(null, [null].concat(nextPromise));
    }
};

function* generator (functions) {
    for (var i = 0; i < functions.length; i++) {
        var args = yield getPromise(functions[i], args);
    };
    yield args;
};

function getPromise (func, args) {
    return new Promise ((resolve, reject) => {
        "use strict";
        if (args) {
            args.push(callback);
            func.apply(null, args);
        }
        else func(callback);

        function callback() {
            if (arguments[0] !== null) reject(arguments[0]);
            else resolve(Array.prototype.slice.call(arguments, 1));
        };
    });
};

module.exports = function (functions, finalCallback) {
    execute(generator(functions), finalCallback);
};