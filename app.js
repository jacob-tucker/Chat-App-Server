const http = require('http');
const cors = require('cors');
const hostname = '127.0.0.1';
const port = process.env.PORT || 5000;

const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const {AddUser, FindUser, RemoveUser} = require('./users.js')

app.use(cors());

//This is required to send something to the server or an error will pop up, we put '/' for that specific link
//app.get means “Run this on a GET request, for the given URL”
//Necessary for express and socket.io

//sendFile just sends the index.html file and displays it on the server's screen
app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

//Tells the server what port to listen to and can add a function to talk to command line
server.listen(port, () => {
  console.log("Server is up!");
});

//For socket.io
io.on('connection', (socket) => {
  socket.on('join', ({name, room}, callback) => {
    socket.join(room);
    AddUser(name, room, socket.id);
    console.log("hello!");
    socket.broadcast.emit('message', {message: `${name} has joined the room!`, name: name});
  })

  socket.on('disconnect', () => {
    let id = socket.id
    let user = FindUser(id)
    let name = user.name;
    io.to(user.room).emit('message', {message: `${name} has left the room!`, name: name});

    RemoveUser(id)
  })

  //Remember the only reason we can just write message, name is because of ES6 syntax because theyre the same name and their
  //variable names
  socket.on('sendMessage', ({name, room, message}, callback) => {
    io.to(room).emit('message', {message, name})
    callback()
  });
});
