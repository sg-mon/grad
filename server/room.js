let socketio   = require('./socket.js').io;
let Enemy      = require('./enemy.js');
let world      = require('./handlers/world.js');
let Bonus      = require('./bonus.js');
let rMath      = require('./rmath.js');
let constants  = require('./constants.js');
let bonusTemplate =
{
	list: {},
};
let Player     = require('./player.js');
let PlayerList = Player.list;

class Room
{
	// все комнаты
	static list = {};
	// получить список всех
	static getRoomsList()
	{
		let rooms = {};
		for (let room of Object.values(this.list))
		{
			rooms[room.id] =
			{
				id            : room.id,
				title         : room.title,
				maxPlayerCount: room.maxPlayerCount,
				playerCount   : Object.keys(room.players.list).length,
				difficulty    : room.difficulty,
				location      : room.location,
			};
		}
		return rooms;
	}
	// получить данные о конкретной комнате
	static getRoom(id)
	{
		return {
			id            : id,
			title         : this.list[id].title,
			maxPlayerCount: this.list[id].maxPlayerCount,
			playerCount   : Object.keys(this.list[id].players.list).length,
			difficulty    : this.list[id].difficulty,
			location      : this.list[id].location,
		};
	}
	constructor(ns, data, socketId, name)
	{
		this.id             = rMath.rand(100000, 999999);
		this.title          = data.title;
		this.namespace      = ns;
		this.difficulty     = data.difficulty;
		this.location       = data.location;
		this.maxPlayerCount = +data.playerCount;
		this.difficulty     = data.difficulty;
		this.bonuses        = Object.assign({}, bonusTemplate);
		this.leaderId       = socketId;
		this.name           = name;
		this.stopGame       = false;
		// методы для работы со всеми игроками комнаты
		this.players        =
		{
			// список всех игроков комнаты
			list: {},
			// обновление списка
			update(roomId)
			{
				for (let id in this.list)
					this.list[id].update();

				socketio.of('/pve').to(roomId).emit('updateClientOnPlayers', this.generateCurrentStatusPackage());
			},
			// обработка отключения сокета
			onDisconnect(roomId, id)
			{
				if (id in this.list)
				{
					this.list[id].destroy();
					delete this.list[id];

					socketio.of('/pve').to(roomId).emit('disconnectPlayer', id);
				}
			},
			// генерирует данные для клиентской части
			generateCurrentStatusPackage()
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
		// методы для работы со всеми противниками в комнате
		this.enemies =
		{
			list: {},
			waveNumber: 0,
			wavesOver: false,
			init: false,
			update(playerList, diff, roomId)
			{
				if (!Object.keys(this.list).length && this.init)
					this.createWave(diff, roomId);
				
				for (let id in this.list)
				{
					if (this.list[id].dead)
					{
						delete this.list[id]
						socketio.of('/pve').to(roomId).emit('removeEnemy', id);
						continue;
					}

					this.list[id].update(playerList);
				}
				socketio.of('/pve').to(roomId).emit('updateClientOnEnemies', this.generateCurrentStatusPackage());
			},
			// генерирует данные для клиентской части
			generateCurrentStatusPackage()
			{
				let pack = {};
				for(let i in this.list)
					pack[i] =
					{
						position: this.list[i].body.position,
						angle:    this.list[i].angle,
						type:     this.list[i].type
					};

				return pack;
			},
			// создание волны нападения противников, данные о волнах хранятся в constans.js
			createWave(diff, roomId)
			{
				if (!constants.GAME[diff].waves[this.waveNumber])
				{
					this.wavesOver = true;
					return;
				}

				for (let enemyType in constants.GAME[diff].waves[this.waveNumber])
					for (let i = 0; i < constants.GAME[diff].waves[this.waveNumber][enemyType]; i+=2)
					{
						let enemy = new Enemy(enemyType, roomId);
						socketio.of('/pve').to(roomId).emit('createEnemy', {id: enemy.id,  position: [enemy.x, enemy.y],  type: enemy.type});
						this.list[enemy.id] = enemy;
						setTimeout(()=>
						{
							enemy = new Enemy(enemyType, roomId);
							socketio.of('/pve').to(roomId).emit('createEnemy', {id: enemy.id,  position: [enemy.x, enemy.y],  type: enemy.type});
							this.list[enemy.id] = enemy;
						},rMath.rand(400, 1500));
					}

				this.waveNumber++;
			}
		};
		// методы для работы со всеми бонусами в комнате
		this.bonuses = 
		{
			list: {},
			update(roomId)
			{
				for (let id in this.list)
					if (this.list[id].dead)
					{
						socketio.of('/pve').to(roomId).emit('destroyBonus', id);
						delete this.list[id];
						continue;
					}

				this.randomSpawn(roomId);
			},
			// генерирует данные для клиентской части 
			generateCurrentStatusPackage()
			{
				let pack = {};
				for(let i in this.list)
					pack[i] =
					{
						position: this.list[i].position,
						category: this.list[i].category,
						type:     this.list[i].type
					};

				return pack;
			},
			// появление случайного 
			randomSpawn(roomId)
			{
				if(Object.keys(this.list).length >= constants.MAXBONUSCOUNT)
					return;

				let x        = Math.random() * constants.WORLDWIDTH,
					y        = Math.random() * constants.WORLDHEIGHT,
					type     = Math.ceil(Math.random() * 10),
					item;

				switch(type)
				{
					case 1:
					case 2:
						item = new Bonus('ammo', 'shotgunammo', [x, y], 8);
					break;
					case 3:
					case 4:
						item = new Bonus('ammo', 'sniperammo', [x, y], 4);
					break;
					case 5:
						item = new Bonus('cure', 'cure', [x, y], 16);
					break;
					default:
						item = new Bonus('ammo', 'rifleammo', [x, y], 16);
					break;
				}
				this.list[item.id] = item;
				socketio.of('/pve').to(roomId).emit('createBonus', item);
			}
		};
		this.constructor.list[this.id] = this;
	}
	// добавление нового игрока
	addPlayer(socket, name)
	{
		if (!this.players.list)
			this.players.list = {};

		let player = new Player(socket, this.namespace, this.id, name);
		
		console.log("Player connected with ID: " + socket.id);

		socket.emit('connectToRoom', socket.id);

		socket.emit('onInitialJoinPopulatePlayers', this.players.generateCurrentStatusPackage());
		socket.emit('onInitialJoinPopulateEnemies', this.enemies.generateCurrentStatusPackage());
		socket.emit('onInitialJoinPopulateBonus', this.bonuses.generateCurrentStatusPackage());

		socket.on('updateServer', function(data)
		{
			player.inputs = Object.assign({},data.inputs);
			player.angle  = data.angle;
		});

		socketio.of('/pve').to(this.id).emit('newPlayer', socket.id);

		socket.on('useRequest', function(cursorPosition)
		{
			player.useRequest(socket.id, cursorPosition);
		});

		socket.on('changeInventory', function(invInd)
		{
			player.changeInventory(invInd);
		});


		this.players.list[player.id] = player;
		this.enemies.update(this.players.list, this.diff, this.roomId);
	}
	// конец игры
	endGame()
	{
		this.stopGame = true;
		let data = [];

		for (let id in this.players.list)
			data.push({name: this.players.list[id].name, kills: this.players.list[id].kills, deaths: this.players.list[id].deaths});

		socketio.of('/pve').to(this.id).emit('endGame', data);

		for (let socketId in socketio.of('/pve').to(this.id).sockets)
		{
			socketio.of('/pve').to(this.id).sockets[socketId].leave(this.id);
			delete this.players.list[socketId];
		}
	}
	updateAll()
	{
		if (!this.enemies.init && Object.keys(this.players.list).length === this.maxPlayerCount)
			this.enemies.init = true;

		if (this.enemies.wavesOver)
		{
			this.endGame();
			return;
		}

		this.players.update(this.id);

		if (!Object.keys(this.players.list).length)
			return;

		this.enemies.update(this.players.list, this.difficulty, this.id);
		this.bonuses.update(this.id);
	}
}

module.exports = Room;