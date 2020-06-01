let p2        = require('p2');
let socket    = require('./server/socket.js');
let Player    = require('./server/player.js');
let Enemy     = require('./server/enemy.js');
let world     = require('./server/handlers/world.js');
let collision = require('./server/handlers/collision.js');
// let Block = require('./server/block.js');
// let GroundItem = require('./server/grounditem.js');

let SOCKET_LIST = socket.SOCKET_LIST;
let playersLength = 0;
let io = socket.io;

let lastConnectedSocket = null;

// Block.initMap();
setInterval(function ()
{
	if(lastConnectedSocket != socket.getLastConnectedSocket())
	{
		lastConnectedSocket = socket.getLastConnectedSocket();
		SOCKET_LIST[lastConnectedSocket.id] = lastConnectedSocket;
		Player.onConnect(lastConnectedSocket);
		playersLength++;
		Enemy.onPlayerConnect(lastConnectedSocket);
		// Block.onPlayerConnect(socket);
		// GroundItem.onPlayerConnect(socket);
		lastConnectedSocket.on('disconnect', function ()
		{
			lastConnectedSocket.broadcast.emit('playerDisconnect', lastConnectedSocket.id);
			Player.onDisconnect(lastConnectedSocket);
			playersLength--;
			delete SOCKET_LIST[lastConnectedSocket.id];
		});
	}
}, 1000/10);



//Physics loop
let lastTime = Date.now();

let waveNumber = 1;

setInterval(function ()
{
	let enemiesAlive  = Object.keys(Enemy.wave).length,
		delta = Date.now() - lastTime;

	lastTime = Date.now();

	Player.update();

	world.step(delta/1000);


	collision.update();
	if(!enemiesAlive)
	{
		// GroundItem.randomlySpawnAmmo();
		Enemy.createWave();
	}
}, 1000/60);

//Update clients loop
setInterval(function ()
{
	for(let i in SOCKET_LIST)
	{
		try
		{
			SOCKET_LIST[i].emit('updateClientOnPlayers', Player.generateCurrentStatusPackage());
			SOCKET_LIST[i].emit('updateClientOnEnemies', Enemy.generateCurrentStatusPackage());
		}
		catch(error)
		{
		  console.log(error, i);
		}
	}
}, 1000/40);


// setInterval(function ()
// {
// 	Block.update();
// }, 5000);


setInterval(()=>
{
	if (playersLength)
		Enemy.updateAll(Player.list);
}, 200);