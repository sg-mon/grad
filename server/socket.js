let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http,{});
let path = require('path');

app.get('/', function (req, res)
{
	res.sendFile(path.join(__dirname, '../client', 'index.html'));
});
// дает доступ к js, css и картинкам, хранящимся в папках
app.use('/client', express.static(path.join(__dirname, '../client')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));

http.listen(8080, function ()
{
	console.log( "Listening on localhost, port 8080");
});

exports.io = io;