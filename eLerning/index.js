const express = require('express');
const app = express();
const port = process.env.port || 3000;
app.use(express.static('./public'));
app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', (req, res) => {
    res.render('home');
});

const server = require('http').Server(app);
server.listen(3000);

const io = require('socket.io')(server);
var arrUser = [];
var arrayClass = [];
io.on('connection', (socket) => {
    console.log(socket.id + 'da ket noi');
    console.log(socket.adapter.rooms);
    socket.on('CLIENT_SEND_ACCOUNT', (account) => {
        if (arrUser.indexOf(account) >= 0) {
            socket.emit('SERVER_SEND_FAIL');
        } else {
            arrUser.push(account);
            socket.username = account;
            socket.emit('SERVER_SEND_SUCCESS');
            io.sockets.emit('SERVER_SEND_ARRAY_USER', arrUser);
            io.sockets.emit('SERVER_SEND_ARRAY_CLASS', arrayClass);
        }
    });

    socket.on('LOGOUT', () => {
        arrUser.splice(
            arrUser.indexOf(socket.username, 1)
        );
        socket.broadcast.emit('SERVER_SEND_ARRAY_USER', arrUser);
    });

    socket.on('disconnect', () => {
        arrUser.splice(
            arrUser.indexOf(socket.username, 1)
        );
        socket.broadcast.emit('SERVER_SEND_ARRAY_USER', arrUser);
    });

    socket.on('CLIENT_SEND_MESSAGE', (txtMessage) => {
        io.sockets.emit('SERVER_SEND_MESSAGE', { username: socket.username, message: txtMessage });
    });


    socket.on('CLIENT_CREATE_CLASS', (className) => {
        socket.join(className);
        socket.class = className;

        

        arrayClass.push(className);
        io.sockets.emit('SERVER_SEND_ARRAY_CLASS', arrayClass);
        socket.emit('SERVER_SEND_ROOM_SOCKET', className);
    });


});
