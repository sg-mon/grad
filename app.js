let socketio    = require('./server/socket.js').io;
let world       = require('./server/handlers/world.js');
let $this       = socketio.of('/pve');
let Room        = require('./server/room.js');
let collision   = require('./server/handlers/collision.js');
let rooms       = Room.list;
let SOCKET_LIST = {};
let lastTime = Date.now();

let game = setInterval(function ()
{
	let delta = Date.now() - lastTime;

	lastTime = Date.now();
	for(let roomId in rooms)
	{
		if (rooms[roomId].stopGame)
		{
			delete rooms[roomId];
			socketio.of('/pve').emit('removeRoom', roomId);
			continue;
		}
		rooms[roomId].updateAll();
	}

	collision.update();

	world.step(delta/1000);

	// Bonus.randomSpawn();
}, 1000/60);

$this
.on('connect', (socket) => {
	SOCKET_LIST[socket.id] = socket;

	socket.emit('roomsList', Room.getRoomsList());
	socket.on('createRoom', (data)=>
	{
		let newRoom = new Room("pve", data, socket.id);
		socket.emit('newRoom', Room.getRoom(newRoom.id));
		socketio.of('/pve').emit('roomsList', Room.getRoomsList());
	});

	socket.on('joinRoom', (roomToJoin, playerName)=>
	{
		if (Object.keys(rooms[roomToJoin].players.list).length === +rooms[roomToJoin].maxPlayerCount)
		{
			console.log(`Room ${roomToJoin} already fool`);
			return;
		}

		if (!rooms[roomToJoin])
		{
			console.log(`No room with id ${roomToJoin}`);
			return;
		}

		if (Object.keys(rooms[roomToJoin].players.list).length >= +rooms[roomToJoin].maxPlayerCount)
		{
			console.log(`Room with id ${roomToJoin} already full.`);
			return;
		}
		socket.join(roomToJoin);

		rooms[roomToJoin].addPlayer(socket, playerName);
		socketio.of('/pve').emit('updateRoom', Room.getRoomsList());
	});
	socket.on('disconnect', ()=>
	{
		for (let roomId in rooms)
			rooms[roomId].players.onDisconnect(roomId, socket.id);

		socketio.of('/pve').emit('updateRoom', Room.getRoomsList());
	});
});
// function updateUsersInRoom(roomToJoin)
// {
// 	// Send back the number of users in this room to ALL sockets connected to this room
// 	$this.in(roomToJoin).clients((error,clients)=>
// 	{
// 		// io.of("pve").in(roomToJoin).emit('updateMembers',clients.length);
// 	})
// }
module.exports = $this;