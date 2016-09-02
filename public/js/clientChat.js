var stat = document.querySelector("#status ul");
var form = document.querySelector("#room form");
var chat = document.querySelector("#room ul");

var socket;

var reconnectionCount = 1,
    MAX_RECONNECTION_COUNT = 10;

function connect () {
    socket = new WebSocket("ws://" + window.location.hostname + ":3000");

    socket.addEventListener("open", function () {
        reconnectionCount = 1;
        showStatus("Connected");
    });

    socket.addEventListener("message", function (event) {
        showMessage(event.data);
    });

    socket.addEventListener("error", function (error) {
        showStatus(error.message);
    });

    socket.addEventListener("close", function (event) {
        if(event.wasClean) {
            showStatus("Connection closed");

            var logoutForm = document.createElement("form");

            logoutForm.method = "GET";
            logoutForm.action = "/";
            logoutForm.submit();
        } else {
            if (reconnectionCount > MAX_RECONNECTION_COUNT) {
                showStatus("Connection is lost forever");
                return;
            }

            showStatus("Connection lost, trying to connect...");
            setTimeout(connect, 1000 * reconnectionCount);
            reconnectionCount++;
        };
    });
};

form.addEventListener("submit", function (event) {
    var input = this.elements.input;
    var text = input.value;

    if(socket.readyState !== 1) {
        showStatus("Message has not been sent. No connection");
        event.preventDefault();
        return;
    };

    socket.send(text);
    input.value = "";

    event.preventDefault();
});

function showMessage(text) {
    var message = document.createElement("li");
    message.textContent = text;
    chat.appendChild(message);
};

function showStatus(text) {
    var message = document.createElement("li");
    message.textContent = text;
    stat.appendChild(message);
};

connect();