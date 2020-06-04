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


// exports.emitAll = function(emitMessage, namespace, room, data)
// {
// 	console.log('emitAll', SOCKET_LIST, "\n\n\n\nn\n\n\\n", 2487124182947128472194718947128471298471284127419287, "\n\n\n\n\n\\n\n");
// 	// for(let i in SOCKET_LIST)
// 	// 	try {
// 	// 		SOCKET_LIST[namespace][room][i].emit(emitMessage, data);
// 	// 	}
// 	// 	catch(error) {
// 	// 		console.log("emitAll failed with error: ", error);
// 	// 	}
// };

// exports.emitOne = function(id, emitMessage, data)
// {
// 	try {
// 		SOCKET_LIST[id].emit(emitMessage, data);
// 	}
// 	catch(error) {
// 		console.log("emit failed with error: ", error);
// 	}
// };