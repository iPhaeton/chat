var logout = document.getElementById("logout");
logout.onclick = function (event) {
    var xhrLogout = new XMLHttpRequest();

    xhrLogout.onload = xhrLogout.onerror = function () {
        if (this.status === 200) {
            var logoutForm = document.createElement("form");

            logoutForm.method = "GET";
            logoutForm.action = "/";
            logoutForm.submit();
        };
    };

    xhrLogout.open("POST", "/logout", true);
    xhrLogout.send();

    return false;
};