const users = {
  "alice": {
    name: "alice",
    friends: ['bob'],
  },
  "bob": {
    name: "bob",
    friends: ['alice']
  }
};
const chat = [];

module.exports = function (io) {

  function verifyFriend(e, socket) {
    if (e.name == e.friendName) {
      socket.emit("errorMessage", {
        message: "invalid friend name",
      });
      return;
    }

    if (!users[e.name]) {
      socket.emit("errorMessage", {
        message: "you are not registered",
      });
      socket.emit("logout");
      return;
    }

    if (!users[e.friendName]) {
      socket.emit("errorMessage", {
        message: "friend is not registered",
      });
      return;
    }

    const friends = users[e.name].friends;

    if (friends.indexOf(e.friendName) == -1) {
      socket.emit("errorMessage", {
        message: "you both are not friends!",
      });
      return;
    }
  }

  function getMessages(name, friendName) {
    return chat.filter(item => item.name == name || item.name == friendName);
  }


  io.on("connection", function (socket) {
    console.log("Users", users);
    socket.on("register", (data) => {
      const name = data.name;
      if (!users[name]) {
        users[name] = {
          name,
          socket,
          friends: [],
        };

        socket.emit("registerSuccess", {
          name: users[name].name,
        });
      } else {
        users[name].socket = socket;
        socket.emit("loginSuccess", {
          name: name,
          friends: users[name].friends,
        });
      }
    });

    socket.on("login", (e) => {
      if (!users[e.name]) {
        socket.emit("errorMessage", {
          message: "user not registered",
        });
        socket.emit("logout");
      } else {
        users[e.name].socket = socket;
        socket.emit("loginSuccess", {
          name: e.name,
        });

        socket.emit("friendList", {
          friends: users[e.name].friends,
        });
      }
    });

    socket.on("addFriend", (e) => {
      console.log("addFriendEvent", e);
      if (e.name == e.friendName) {
        socket.emit("errorMessage", {
          message: "invalid friend name",
        });
        return;
      }

      if (!users[e.name]) {
        socket.emit("errorMessage", {
          message: "you are not registered",
        });
        socket.emit("logout");
        return;
      }

      if (!users[e.friendName]) {
        socket.emit("errorMessage", {
          message: "friend is not registered",
        });
        return;
      }

      const friends = users[e.name].friends;

      if (friends.indexOf(e.friendName) >= 0) {
        socket.emit("errorMessage", {
          message: "you both are already friends!",
        });
        return;
      }

      users[e.name].friends.push(e.friendName);
      users[e.friendName].friends.push(e.name);

      socket.emit("friendList", {
        friends: users[e.name].friends,
      });

      if (users[e.friendName].socket) {
        users[e.friendName].socket.emit("friendList", {
          friends: users[e.friendName].friends,
        });
      }
    });

    socket.on("verifyFriend", (data) => {
      verifyFriend(data, socket);
      console.log("verify ", users[data.name]);
      socket.emit('retrieveMessages', getMessages(data.name, data.friendName));
    });

    socket.on("message", (data) => {
      console.log("message", data);
      verifyFriend(data, socket)
      chat.push(data);

      console.log("receiver ", users[data.friendName]);
      
      if(users[data.friendName].socket) {
        console.log("sending message");
        users[data.friendName].socket.emit("message", {
          message: data.message,
          name: data.friendName,
          friendName: data.name
        });
      }
    });
  });
};
