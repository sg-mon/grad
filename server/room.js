let socketio   = require('./socket.js').io;
let Player     = require('./player.js');
let Enemy      = require('./enemy.js');
let world      = require('./handlers/world.js');
let collision  = require('./handlers/collision.js');
let Bonus      = require('./bonus.js');
let rMath      = require('./rmath.js');
let PlayerList = Player.list;

let playerTemplate = 
{
	list: null,
	update(roomId)
	{
		for (let id in this.list)
			this.list[id].update();

		socketio.of('/pve').to(roomId).emit('updateClientOnPlayers', this.generateCurrentStatusPackage(roomId));
	},
	onDisconnect(id)
	{
		if (id in this.list)
		{
			this.list[id].destroy();
			delete this.list[id];
		}
	},
	generateCurrentStatusPackage(roomId)
	{
		let pack = {}
		if (!this.list)
			return;

		for(let i in this.list)
			pack[i] =
			{
				position:     this.list[i].body.position,
				angle:        this.list[i].angle,
				hp:           this.list[i].hp,
				inventory:    this.list[i].inventory,
				kills:        this.list[i].kills,
				activeWeapon: this.list[i].activeWeapon,
			};

		return pack;
	}
};
let enemyTemplate = 
{
	list: null,
	update(playerList)
	{
		for (let id in this.enemies)
			this.enemies[id].update(playerList);
	},
	onDisconnect(id)
	{
		if (id in this.players)
		{
			this.players[id].destroy();
			delete this.players[id];
		}
	},
	generateCurrentStatusPackage()
	{
		let pack = {};
		for(let i in this.enemies)
			pack[i] =
			{
				position: this.enemies[i].body.position,
				angle:    this.enemies[i].angle
			};

		return pack;
	},
	createWave()
	{
		for (let i = 0; i < this.enemiesWaveLength; i++)
		{
			let enemy = new Enemy();
			socket.emitAll('createEnemy', {id: enemy.id, position: [enemy.x, enemy.y]});
			this.enemies[enemy.id] = enemy;
		}

		this.enemiesWaveLength += 4;
	},
	check()
	{
		let enemiesAlive  = Object.keys(this.enemies).length;
		if (!enemiesAlive)
			this.createEnemyWave();
	}
};
let bonusTemplate =
{
	list: null,
};

class Room
{
	static list = {};
	static getRoomsList()
	{
		let rooms = {};
		for (let room of Object.values(this.list))
			rooms[room.id] =
			{
				id: room.id,
				name: room.name,
				maxPlayerCount: room.maxPlayerCount,
				playerCount: room.playerCount,
			};

		return rooms;
	}
	constructor(namespace, title, maxPlayerCount)
	{
		this.id             = rMath.rand(100000, 999999);
		this.title          = title;
		this.namespace      = namespace;
		this.maxPlayerCount = maxPlayerCount;
		this.playerCount    = 0;
		this.players        = Object.assign({}, playerTemplate);
		this.enemies        = Object.assign({}, enemyTemplate);
		this.bonuses        = Object.assign({}, bonusTemplate);

		this.constructor.list[this.id] = this;
	}
	addPlayer(socket)
	{
		if (!this.players.list)
			this.players.list = {};

		let player = new Player(socket, this.namespace, this.id);
		
		console.log("Player connected with ID: " + socket.id);

		socket.emit('connectToRoom', socket.id);

		socket.emit('onInitialJoinPopulatePlayers', this.players.generateCurrentStatusPackage(this.id));

		socket.on('updateServer', function(data)
		{
			player.inputs = Object.assign({},data.inputs);
			player.angle  = data.angle;
		});

		// socket.broadcast.emit('newPlayer', socket.id);
		socket.broadcast.to(this.id).emit('newPlayer', socket.id);

		socket.on('useRequest', function(cursorPosition)
		{
			player.useRequest(socket.id, cursorPosition);
		});

		socket.on('changeInventory', function(invInd)
		{
			player.changeInventory(socket.id, invInd);
		});

		// socket.emit('onInitialJoinPopulateEnemies', this.enemies.generateCurrentStatusPackage());

		this.players.list[player.id] = player;
	}
	updateAll()
	{
		this.players.update(this.id);
		// this.enemies.update();
		// this.bonuses.update();
	}
}

module.exports = Room;