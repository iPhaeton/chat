var stat = document.querySelector("#status ul");
var form = document.querySelector("#room form");
var chat = document.querySelector("#room ul");

var socket;

function connect () {
    socket = new WebSocket("ws://" + window.location.hostname + ":8081");

    socket.addEventListener("open", function () {
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
        } else {
            showStatus("Connection lost, trying to connect...");
            setTimeout(connect, 5000);
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