var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
    res.send('<h1>Hello world</h1>');
});

let idMap = new Map();

io.on('connection', function (socket) {
    console.log('client ' + socket.id + ' connected');
    socket.on('login', function (data) {
        idMap.set(socket.id, data.username);
        data.id = socket.id;
        let tempMap = {};
        for (var [key, value] of idMap.entries()) {
            tempMap[key] = value;
        }
        socket.emit('getuser', {map: tempMap, id: socket.id});
        io.sockets.emit('someoneonline', data);
    });
    socket.on('chat', function (data) {
        io.sockets.emit('chat', data);
    });
    socket.on('disconnect', function () {
        console.log('client ' + socket.id + ' disconnected');
        socket.broadcast.emit('someoneoffline', {id: socket.id});
        idMap.delete(socket.id);
    })
});

http.listen(3000, function () {
    console.log('已连接');
});
