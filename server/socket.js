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

exports.io = io;