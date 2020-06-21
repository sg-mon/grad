let socketio    = require('./server/socket.js').io;
let world       = require('./server/handlers/world.js');
let $this       = socketio.of('/pve');
let Room        = require('./server/room.js');
let collision   = require('./server/handlers/collision.js');
let rooms       = Room.list;
let lastTime = Date.now();

// происходит обновление всего в комнате - игроки, противники, бонусы
let game = setInterval(function ()
{
	let delta = Date.now() - lastTime;

	lastTime = Date.now();
	for(let roomId in rooms)
	{
		// завершение игры в комнате
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
}, 1000/60);

// подключение сокета к пространству имен /pve
$this
.on('connect', (socket) => {
	socket.emit('roomsList', Room.getRoomsList());
	socket.on('createRoom', (data)=>
	{
		let newRoom = new Room("pve", data, socket.id);
		socket.emit('newRoom', Room.getRoom(newRoom.id));
		socketio.of('/pve').emit('roomsList', Room.getRoomsList());
	});
	// подключение к определенной комнате
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
	// отключение игрока, удаление его из списка
	socket.on('disconnect', ()=>
	{
		for (let roomId in rooms)
			rooms[roomId].players.onDisconnect(roomId, socket.id);

		socketio.of('/pve').emit('updateRoom', Room.getRoomsList());
	});
});
module.exports = $this;