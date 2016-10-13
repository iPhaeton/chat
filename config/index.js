var config = require("./config");
var errors = require("errors/errors")

var check = new Check();

function get (parameter, checkParameter) {
    //check, if parameter exists in config
    var parameters = parameter.split(":");
    var obj = config;
    for (var i = 0; i < parameters.length; i++){
        if (obj[parameters[i]] === undefined) throw new errors.MissingConfig (parameter);
        else obj = obj[parameters[i]];
    };


    //check, if parameter value in config is correct
    var value = obj;
    if (check[checkParameter]) {
        if (check[checkParameter](value)) var correctValue = true;
        else var correctValue = false;
    }
    else var correctValue = true;

    if (correctValue) return value;
    else throw new errors.WrongConfig(parameter);
};

function Check () {};

Check.prototype["isNumeric"] = function (value) {
    return !isNaN(parseFloat(value)) && isFinite(value)
};

Check.prototype["isMongooseURI"] = function (value) {
    return (value.indexOf("mongodb://localhost/") === 0);
};

exports.get = get;