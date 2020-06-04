let socketio    = require('./server/socket.js').io;
let world       = require('./server/handlers/world.js');
let $this       = socketio.of('/pve');
let Room        = require('./server/room.js');
let rooms       = Room.list;
let SOCKET_LIST = {};

let lastTime = Date.now();

setInterval(function ()
{
	let delta = Date.now() - lastTime;

	lastTime = Date.now();
	for(let roomId in rooms)
	{
		rooms[roomId].updateAll();
		// rooms[roomId].enemiesUpdate(rooms[roomId].players);
	}

	world.step(delta/1000);

	// collision.update();
	// Bonus.randomSpawn();

	// if(!enemiesAlive)
	// {
	// 	Enemy.createWave();
	// }
}, 1000/60);

// setInterval(function ()
// {
// 	for (let roomId in rooms)
// 		for (let playerId in rooms[roomId].players)
// 			try
// 			{
// 				$this.to(roomId).emit('updateClientOnPlayers', rooms[roomId].players.generateCurrentStatusPackage());
// 			}
// 			catch(e)
// 			{
// 				console.log("pve.js - line 42",e);
// 			}

// }, 1000/40);

$this
.on('connect', (socket) => {
	SOCKET_LIST[socket.id] = socket;

	socket.emit('roomsList', Room.getRoomsList());
	socket.on('createRoom', (data)=>
	{
		let newRoom = new Room("pve", data.title, data.playerCount);
		socket.emit('newRoom', newRoom);
	});

	socket.on('joinRoom', (roomToJoin)=>
	{
		if (!rooms[roomToJoin])
		{
			console.log(`No room with id ${roomToJoin}`);
			return;
		}
		const roomToLeave = Object.keys(socket.rooms)[1];
		socket.leave(roomToLeave);
		// updateUsersInRoom(roomToLeave);
		socket.join(roomToJoin);
		// updateUsersInRoom(roomToJoin);

		rooms[roomToJoin].addPlayer(socket);
	});
	socket.on('disconnect', ()=>
	{
		for (let roomId in rooms)
			rooms[roomId].players.onDisconnect(socket.id);
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