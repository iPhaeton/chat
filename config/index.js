var config = require("./config");
var errors = require("errors/errors")

var check = new Check();

function get (parameter, checkParameter) {
    if(config[parameter]) { //check, if parameter exists in config
        //check, if parameter value in config is correct
        if (check[checkParameter]) {
            if (check[checkParameter](config[parameter])) var correctValue = true;
            else var correctValue = false;
        }
        else var correctValue = true;

        if (correctValue) return config[parameter];
        else throw new errors.WrongConfig(parameter);
    }
    else {
        throw new errors.MissingConfig (parameter);
    }
};

function Check () {

};

Check.prototype["isNumeric"] = function (value) {
    return !isNaN(parseFloat(value)) && isFinite(value)
};

exports.get = get;