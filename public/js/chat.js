function getUserName() {
  return localStorage.getItem("userName");
}

function getParameterByName(name) {
  const url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function getFriendName() {
  const friend = getParameterByName("friend");
  if (!friend) {
    window.location.href = "./";
    return;
  }
  return friend;
}

function displayError(message) {
  const toastHeader = document.getElementById("toast-header");
  toastHeader.innerHTML = "Error";
  const toastBody = document.getElementById("toast-body");
  toastBody.innerHTML = message;
  $("#toast").toast("show");
}

function registerSocketEvents() {
  window.socket = io();

  window.socket.on("errorMessage", (e) => {
    displayError(e.message);
  });

  window.socket.on("message", (e) => {
    console.log("receiving message", e);
    if ((e.friendName = getFriendName())) {
      addMessage(e.friendName, e.message, false);
    }
  });

  window.socket.on("logout", (e) => {
    localStorage.clear();
    window.location.reload();
  });

  window.socket.on("retrieveMessages", (e) => {
    console.log("messages", e);
    for(let i = 0; i < e.length; i++) {
      if(e[i].name == getUserName()) {
        addMessage("Me", e[i].message, true);
      } else {
        addMessage(e[i].name, e[i].message, false);
      }
    }
  });
}

window.onload = () => {
  const messageBox = document.getElementById("messages");
  messageBox.scrollTop = messageBox.scrollHeight;

  registerSocketEvents();

  const chatForm = document.getElementById("chat-form");
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const message = document.getElementById("chat-text-box");
    message.value = message.value.trim();

    if (message.value != "") {
      socket.emit("message", {
        name: getUserName(),
        friendName: getFriendName(),
        message: message.value,
      });

      addMessage("Me", message.value, true);
      message.value = "";
    }
  });

  const userName = getUserName();
  if (!userName) {
    window.location.href = "./";
  } else {
    window.socket.emit("login", { name: userName });

    socket.emit("verifyFriend", {
      name: getUserName(),
      friendName: getFriendName(),
    });
  }
};

function addMessage(userName, message, isRight = false) {
  const messageBox = document.getElementById("messages");

  const isScrolledToBottom =
    messageBox.scrollHeight - messageBox.clientHeight <=
    messageBox.scrollTop + 1;

  messageBox.appendChild(getMessageDiv(userName, message, isRight));

  if (isScrolledToBottom) {
    messageBox.scrollTop = messageBox.scrollHeight - messageBox.clientHeight;
  }
}

function getMessageDiv(userName, message, isRight = false) {
  const newElement = document.createElement("div");

  if (isRight) {
    newElement.style.textAlign = "right";
  }

  newElement.textContent = format(userName, ":", message);
  return newElement;
}

function format() {
  return Array.prototype.slice.call(arguments).join(" ");
}
