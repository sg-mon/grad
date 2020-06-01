let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http,{});
let path = require('path');

let SOCKET_LIST = {};

let lastConnectedSocket = null;
app.get('/', function (req, res)
{
	res.sendFile(path.join(__dirname, '../client', 'index.html'));
});
app.use('/client', express.static(path.join(__dirname, '../client')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));

http.listen(8080, function ()
{
	console.log( "Listening on localhost, port 8080");
});


io.sockets.on('connection', function (socket)
{
	lastConnectedSocket = socket;
});

exports.lastConnectedSocket = lastConnectedSocket;
exports.SOCKET_LIST = SOCKET_LIST;
exports.io = io;

exports.getLastConnectedSocket = function()
{
	return lastConnectedSocket;
};

exports.emitAll = function(emitMessage, data)
{
	for(let i in SOCKET_LIST)
		try {
			SOCKET_LIST[i].emit(emitMessage, data);
		}
		catch(error) {
			console.log("emitAll failed with error: ", error);
		}
};