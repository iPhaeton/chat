var signinButton = document.querySelector("#signin");
var signupButton = document.querySelector("#signup");

signinButton.onclick = function () {
    "use strict";
    document.forms["login-form"].onsubmit = function () {
        var body = "username=" + this.elements.username.value +
            "&password=" + this.elements.password.value;

        var xhrAuth = new XMLHttpRequest();
        xhrAuth.open("POST", "login", true);
        xhrAuth.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        xhrAuth.onload = xhrAuth.onerror = function () {
            if (this.status === 200) {
                window.location.href = "/chat";
            } else if (this.status === 403) {
                document.querySelector(".error").textContent = "Wrong login or password";
            };
        };

        xhrAuth.send(body);

        return false;
    };
};

signupButton.onclick = function () {
    "use strict";
    document.forms["login-form"].onsubmit = function () {
        var body = "username=" + this.elements.username.value +
            "&password=" + this.elements.password.value;

        var xhrAuth = new XMLHttpRequest();
        xhrAuth.open("POST", "signup", true);
        xhrAuth.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        xhrAuth.onload = xhrAuth.onerror = function () {
            if (this.status === 200) {
                window.location.href = "/chat";
            } else if (this.status === 403) {
                document.querySelector(".error").textContent = "The user already exists";
            };
        };

        xhrAuth.send(body);

        return false;
    };
};