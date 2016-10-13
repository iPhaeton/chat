var logout = document.querySelector("#logout");

if (logout) {
    logout.onclick = function (event) {
        event.preventDefault();

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
    };
};