const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const io = require('socket.io');
const path = require('path');
const chat = require('./app.chat');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const socketApp = io.listen(server);

chat(socketApp);

server.listen(port, function(){
  console.log('Server listening on port ' + port);
});