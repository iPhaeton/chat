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
            document.querySelector(".error").textContent = this.statusText;
        };
    };

    xhrAuth.send(body);

    return false;
};