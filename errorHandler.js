/**
 * Created by Phaeton on 21.05.2016.
 */
module.exports = function (error, parameters) {
    var res = parameters.res;
    res.statusCode = error.statusCode;
    res.end(error.message);

    if (process.env.NODE_ENV === "development") {
        console.log (error.stack);
    };
};