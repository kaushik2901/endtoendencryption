window.socket = null;

function getUserName() {
  return localStorage.getItem("userName");
}

function registerName(name) {
  socket.emit("register", { name });
}

function addFriend(name) {
  socket.emit("addFriend", {
    name: getUserName(),
    friendName: name,
  });
}

function renderFriends(friends) {
  const friendsList = document.getElementById("friendsList");
  console.log(friends);
  friendsList.innerHTML = friends
    .map(
      (name) => `
    <li class="list-group-item">
        <a href="./chat.html?friend=${name}">${name}</a>
    </li>
    `
    )
    .join("");
}

function registerSocketEvents() {
  window.socket = io();

  window.socket.on("loginSuccess", (e) => {
    $("#inputNameModel").modal("hide");
    localStorage.setItem("userName", e.name);
  });

  window.socket.on("registerSuccess", (e) => {
    localStorage.setItem("userName", e.name);
    $("#inputNameModel").modal("hide");
  });

  window.socket.on("friendList", (e) => {
    $("#addFriendModel").modal("hide");
    renderFriends(e.friends);
  });

  window.socket.on("errorMessage", (e) => {
    displayError(e.message);
  });

  window.socket.on("message", (e) => {});

  window.socket.on("logout", (e) => {
    localStorage.clear();
    window.location.reload();
  });
}

function displayError(message) {
  const toastHeader = document.getElementById("toast-header");
  toastHeader.innerHTML = "Error";
  const toastBody = document.getElementById("toast-body");
  toastBody.innerHTML = message;
  $("#toast").toast("show");
}

window.onload = () => {

  $("#toast").toast({
    delay: 2000,
  });

  registerSocketEvents();

  const nameForm = document.getElementById("name-form");
  nameForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name-text-box").value.trim();
    if (name != "") {
      registerName(name);
    }
  });

  const friendNameForm = document.getElementById("friend-name-form");
  friendNameForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("friend-name-text-box").value.trim();
    if (name != "") {
      addFriend(name);
    }
  });

  const userName = getUserName();
  if (!userName) {
    $("#inputNameModel").modal("show");
  } else {
    window.socket.emit("login", { name: userName });
  }
};
