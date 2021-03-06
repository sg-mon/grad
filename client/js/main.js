"use strict"

$(document).ready(function()
{
	rin.init();
});

let rin =
{
	$socket: null,
	name: '',
	layer: null,
	// задать имя
	setSocketName(e)
	{
		e.preventDefault();

		if (!$(e.target).find('input').val())
			return;
		this.name = $(e.target).find('input').val();
		this.connect('pve');
		this.cookie.set('name', this.name, {expires:new Date(new Date().getFullYear() + 5, 1).toUTCString(), path: '/'});
		this.showName();
		this.popups.close('.name-popup');
	},
	// показать имя
	showName()
	{
		$('#playerName').show();
		$('#playerName').html(`Вы подключились как <b>${this.name}</b>`);
	},
	// иницивлизация сокета, проверка куков на наличие имени
	init()
	{
		this.$socket = io();
		if (this.cookie.get('name'))
		{
			this.name = JSON.parse(this.cookie.get('name')[1]);
			this.showName();
			this.connect('pve');
		}
	},
	// переход к комнатам
	closeGame()
	{
		window.location.reload();
		return;
	},
	// приходит массив со статистикой игроков, добавляем строки в statistic-popup
	endGame(data)
	{
		for (let row of data)
		{
			let tr = document.createElement('tr'),
				td;
			td = document.createElement('td')
			td.innerText = row.name;
			tr.appendChild(td);
			td = document.createElement('td')
			td.innerText = row.kills;
			tr.appendChild(td);
			td = document.createElement('td')
			td.innerText = row.deaths;
			tr.appendChild(td);

			document.querySelector('#statistic-popup-table').appendChild(tr);
		}

		rin.popups.open('.statistic-popup');
	},
	// инициализация игры
	async initGame()
	{
		await this.preload.start();
		$('._no-game').each(function(ind)
		{
			$(this).addClass('hide');
		});

		$('.game-wr').removeClass('hide');

		await this.game.init();
		winManager.init();
		return Promise.resolve();
	},
	// подключение к namespace
	connect(ns)
	{
		this.$socket = io('/' + ns);
		this.$socket.on('roomsList', rin.rooms.show);
		this.$socket.on('newRoom', rin.rooms.showNewRoom);
		this.$socket.on('updateRoom', rin.rooms.update);
		this.$socket.on('removeRoom', rin.rooms.removeRoom);
		rin.socket.init();
	},
	// объект для работы с комнатами
	rooms:
	{
		all: {},
		// отображает весь список комнат
		show(list)
		{
			$('.rooms').removeClass('hide');
			$('.play').addClass('hide');

			if (!Object.keys(list).length)
				return;

			$('.room-items-empty').addClass('hide');

			for (let id in list)
				rin.rooms.showNewRoom(list[id]);
		},
		// обновляет весь список комнат
		update(list)
		{
			for (let id in list)
				rin.rooms.updateRoom(list[id]);
		},
		// отображает конкретную комнату
		showNewRoom(roomData)
		{
			if (!$('.room-items-empty').hasClass('hide'))
				$('.room-items-empty').addClass('hide');

			if (roomData.id in rin.rooms.all)
				return;

			let roomItem = $('._test-room-item').clone();
			$(roomItem).attr("data-id", roomData.id);
			$(roomItem).removeClass('_test-room-item');
			$(roomItem).find('._room-id').text(roomData.id);
			$(roomItem).find('._room-title').text(roomData.title);
			$(roomItem).find('._room-difficulty').text(rin.rooms.getTranslate(roomData.difficulty));
			$(roomItem).find('._room-location').text(rin.rooms.getTranslate(roomData.location));
			$(roomItem).attr("data-location", roomData.location);
			$(roomItem).find('._room-players').text(`${roomData.playerCount}/${roomData.maxPlayerCount}`);
			if(+roomData.maxPlayerCount === +roomData.playerCount)
				$(roomItem).find('button').attr('disabled', true);

			$('._room-items-all').append(roomItem);
			rin.rooms.all[roomData.id] = roomData;
		},
		// обновляет конкретную комнату
		updateRoom(roomData)
		{
			let room = $(`.room-item[data-id=${roomData.id}]`);
			$(room).find('._room-id').text(roomData.id);
			$(room).find('._room-title').text(roomData.title);
			$(room).find('._room-difficulty').text(rin.rooms.getTranslate(roomData.difficulty));
			$(room).find('._room-location').text(rin.rooms.getTranslate(roomData.location));
			$(room).attr("data-location", roomData.location);
			$(room).find('._room-players').text(`${roomData.playerCount}/${roomData.maxPlayerCount}`);
			if(+roomData.maxPlayerCount === +roomData.playerCount)
				$(room).find('button').attr('disabled', true);

			rin.rooms.all[roomData.id] = roomData;
		},
		// удаление комнаты по id
		removeRoom(id)
		{
			delete rin.rooms.all[id];
			$(`.room-item[data-id=${id}]`).remove();

			if (!Object.keys(rin.rooms.all))
				$('.room-items-empty').removeClass('hide');
		},
		// присоединение игрока к комнате
		async join(e)
		{
			rin.rooms.currentId = $(e.target).closest('.room-item').data('id');
			rin.game.location = $(e.target).closest('.room-item').data('location');

			await rin.initGame();
		},
		// валидация с формы создания комнат и отравка события с данными
		createReq(e)
		{
			e.preventDefault();

			$(e.target).removeClass('error');

			let data = {};
			for (let prop of $(e.target).serializeArray())
				data[prop.name] = prop.value;

			for (let key in data)
				if (!data[key])
				{
					$(e.target).addClass('error');
					return;
				}

			rin.$socket.emit('createRoom', data);
			rin.popups.close('.room-create');
		},
		// перевод для настроек комнаты
		getTranslate(word)
		{
			switch(word)
			{
				case 'easy':
					return 'Легко';
				break;
				case 'medium':
					return 'Средняя';
				break;
				case 'difficult':
					return 'Трудная';
				break;
				case 'nightmare':
					return 'Кошмар';
				break;
				case 'default':
					return 'Луг';
				break;
				case 'city':
					return 'Город';
				break;
				case 'desert':
					return 'Пустыня';
				break;
				case 'canyon':
					return 'Каньон';
				break;
				default:
					return '';
				break;
			}
		}
	},
	// прелоадер всего окна
	preload:
	{
		start()
		{
			window.loading_screen = pleaseWait({
				logo: "/assets/logo.jpg",
				backgroundColor: '#383838',
				loadingHtml: "<div class='spinner'><div class='bounce1'></div><div class='bounce2'></div><div class='bounce3'></div></div>"
			});
			return Promise.resolve();
		},
		stop()
		{
			window.loading_screen.finish();
		}
	},
	// объект для отслеживания нажатий игрока
	inputHandler:
	{
		inputs:
		{
			up: false,
			down: false,
			right: false,
			left: false,
		},
		sendCooldown: 1,
		stop()
		{
			document.onkeydown = ()=>{};
			document.onkeyup = ()=>{};
			window.onblur = ()=>{};
		},
		init()
		{
			//Handle key inputs
			document.onkeydown = (e)=>
			{
				if(e.keyCode === 68)      //d
					this.inputs.right = true;
				else if(e.keyCode === 83) //s
					this.inputs.down = true;
				else if(e.keyCode === 65) //a
					this.inputs.left = true;
				else if(e.keyCode === 87) //w
					this.inputs.up = true;
				else if (e.keyCode >= 49 && e.keyCode <= 57) //1-9
					rin.game.changeInventory(e.keyCode - 48); //1-5

				rin.socket.updateServer();
			};
			document.onkeyup = (e)=>
			{
				if(e.keyCode === 68)      //d
					this.inputs.right = false;
				else if(e.keyCode === 83) //s
					this.inputs.down = false;
				else if(e.keyCode === 65) //a
					this.inputs.left = false;
				else if(e.keyCode === 87) //w
					this.inputs.up = false;

				rin.socket.updateServer();
			};
			window.onblur = ()=>
			{
				this.inputs.right = this.inputs.down = this.inputs.left = this.inputs.up = false;
				rin.socket.updateServer();
			};
		},
		updateMouseDown()
		{
			if (rin.game.ins && rin.game.ins.input.activePointer.leftButton.isDown)
			{
				this.sendCooldown--;
				if (!this.sendCooldown)
				{
					this.sendCooldown = 10;
					rin.GunHandler.useRequest();
				}
			}
		}
	},
	// главный объект игры, работа с Phaser
	game:
	{
		ins:   null,
		map:   null,
		timer: null,
		layer: null,
		start: false,
		location: 'default',
		currentPlayer: null,
		// создается объект игры
		init()
		{
			this.ins = new Phaser.Game("100%", "100%", Phaser.AUTO, 'game',
			{
				preload: this.preload,
				create:  this.create,
				update:  this.update
			});
			return Promise.resolve();
		},
		// загрузка картинок сущностей, отрисовка карты и ui
		preload()
		{
			this.load.image('player', '/assets/player.png');
			this.load.image('enemy-common-1', '/assets/enemy-common-1.png');
			this.load.image('enemy-common-2', '/assets/enemy-common-2.png');
			this.load.image('enemy-medium-1', '/assets/enemy-medium-1.png');
			this.load.image('enemy-medium-2', '/assets/enemy-medium-2.png');
			this.load.image('rifleammo', '/assets/rifleammo.png');
			this.load.image('shotgunammo', '/assets/shotgunammo.png');
			this.load.image('sniperammo', '/assets/sniperammo.png');
			this.load.image('cure', '/assets/cure.png');
			// карта
			this.load.tilemap('map', `/assets/map/map-${rin.game.location}.csv`);
			this.load.image('tiles', '/assets/map/map-tileset.png');
			// ui
			winManager.slickUI = rin.game.ins.plugins.add(Phaser.Plugin.SlickUI);
			winManager.slickUI.load('/assets/UI/kenney.json');
		},
		// создание игры
		create()
		{
			this.game.world.setBounds(200, 20, 1440, 900);
			this.game.map = this.add.tilemap('map', 64, 64);
			this.game.map.addTilesetImage('tiles');

			rin.layer = this.game.map.createLayer(0);
			rin.layer.resizeWorld();
			rin.layer.position.set(1, 1);

			this.game.time.advancedTiming = true;
			this.game.stage.disableVisibilityChange = true;
			this.game.stage.backgroundColor = '#95BCC7';
			this.game.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
			this.game.physics.startSystem(Phaser.Physics.P2JS);
			this.game.input.mouse.capture = true;

			Player.group = this.game.add.group();
			Enemy.group  = this.game.add.group();
			Bonus.group  = this.game.add.group();
			LineDrawer.group  = this.game.add.group();

			rin.game.initCurrentPlayer(rin.$socket.id);
			rin.game.ins.camera.follow(rin.game.currentPlayer.gameObj, Phaser.Camera.FOLLOW_TOPDOWN, 0.1, 0.1);
			rin.game.timer = rin.game.ins.time.events.loop(100, rin.socket.updateServer, this);
			rin.game.start = true;

			rin.$socket.emit('joinRoom', rin.rooms.currentId, rin.name);

			winManager.createUI();

			rin.preload.stop();
		},
		initCurrentPlayer(id)
		{
			this.currentPlayer = new Player(id, true);
		},
		// обновление поворота текущего игрока
		currentPlayerUpdate(data)
		{
			let x = this.ins.camera.x + this.ins.input.mousePointer.x;
			let y = this.ins.camera.y + this.ins.input.mousePointer.y;

			let absAngle = Math.abs(Math.atan((y - this.currentPlayer.gameObj.y) / (x - this.currentPlayer.gameObj.x)) * 180 / Math.PI);
			if(x > this.currentPlayer.gameObj.x && y > this.currentPlayer.gameObj.y)
				this.currentPlayer.gameObj.angle = absAngle;
			else if (x < this.currentPlayer.gameObj.x && y > this.currentPlayer.gameObj.y)
				this.currentPlayer.gameObj.angle = -180 - absAngle;
			else if (x < this.currentPlayer.gameObj.x && y < this.currentPlayer.gameObj.y)
				this.currentPlayer.gameObj.angle = -180 + absAngle;
			else
				this.currentPlayer.gameObj.angle = -absAngle;

			this.currentPlayer.gameObj.x = this.currentPlayer.x = data.position[0];
			this.currentPlayer.gameObj.y = this.currentPlayer.y = data.position[1];
		},
		changeInventory(slot)
		{
			rin.$socket.emit('changeInventory', slot-1);
		},
		successChangeInventory(weaponData)
		{
			let oldSlot = Object.values(rin.game.currentPlayer.inventory).findIndex(item=>
			{
				return item.name === weaponData.oldWeapon
			});

			rin.game.currentPlayer.activeWeapon = weaponData.weapon;
			winManager.updateActiveWeapon(weaponData.slot + 1, oldSlot + 1);
		},
		update()
		{
			rin.inputHandler.updateMouseDown();
			LineDrawer.updateAll();
			winManager.update();
		},
	},
	socket:
	{
		ins: null,
		// вешает обработчики на все события
		init()
		{
			rin.$socket.on('connectToRoom', ()=>
			{	
				rin.$socket.on('newPlayer', Player.addNewPlayer);
				rin.$socket.on('disconnectPlayer', Player.removePlayer);
				rin.$socket.on('onInitialJoinPopulatePlayers', Player.onInitialJoinPopulatePlayers);
				rin.$socket.on('onInitialJoinPopulateEnemies', Enemy.onInitialJoinPopulateEnemies);
				rin.$socket.on('onInitialJoinPopulateBonus', Bonus.onInitialJoinPopulateBonus);
				
				rin.$socket.on('successChangeInventory', rin.game.successChangeInventory);
				rin.$socket.on('updateClientOnPlayers', Player.updateAll);
				rin.$socket.on('updateClientOnEnemies', Enemy.updateAll);
				rin.$socket.on('createEnemy', Enemy.createEnemy);
				rin.$socket.on('removeEnemy', Enemy.removeEnemy);

				rin.$socket.on('createGunShot', rin.GunHandler.createGunShot);
				rin.$socket.on('createBonus', Bonus.createBonus);
				rin.$socket.on('destroyBonus', Bonus.destroyBonus);
				rin.$socket.on('endGame', rin.endGame);


				rin.inputHandler.init();	
			});
		},
		// обновить данные ввода на сервере
		updateServer()
		{
			rin.$socket.emit('updateServer', {inputs: rin.inputHandler.inputs, angle: rin.game.currentPlayer.gameObj.angle});
		}
	},
	GunHandler:
	{
		// отрисовывает выстрел
		createGunShot(data)
		{
			let endx = data.startx + data.length*Math.cos(data.angle/180*Math.PI),
				endy = data.starty + data.length*Math.sin(data.angle/180*Math.PI),
				graphics = new LineDrawer().graphics;

			graphics.moveTo(data.startx, data.starty);
			graphics.lineTo(endx, endy);
		},
		// запрос на создание выстрела
		useRequest()
		{
			let x = rin.game.ins.input.mousePointer.x + rin.game.ins.camera.x,
				y = rin.game.ins.input.mousePointer.y + rin.game.ins.camera.y;
			rin.$socket.emit('useRequest', [x,y]);
		}
	},
	// объект для работы с попапами
	popups:
	{
		open: function(popup)
		{
			$('._overlay').addClass('_show');
			$('body').addClass('ow-hidden');
			$(popup).addClass('_show');

			if (!$(popup).prop("classList").contains('_no-click-outside'))
				setTimeout(()=>
				{
					$(document).on('click',(e)=>{
						if ($(e.target).closest(popup).length) return;
						this.close(popup);
					});
				}, 10);
		},
		close: function(popup)
		{
			$(popup).removeClass('_show');
			$('._overlay').removeClass('_show');
			$('body').removeClass('ow-hidden');

			if (!$(popup).prop("classList").contains('_no-click-outside'))
				$(document).off('click');
		}
	},
	// обект для работы с куками
	cookie:
	{
		set(name, value, options = {})
		{
			let updCookie = name + '=' + JSON.stringify(value);
			for (let propName in options)
			{
				updCookie += "; " + propName;
				let propValue = options[propName];
				if (propValue !== true)
					updCookie += "=" + propValue;
			}

			document.cookie = updCookie;
		},
		get(name)
		{
			let match = document.cookie.match(new RegExp(
			"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
			));
			return match;
		},
		delete(name)
		{
			document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
		}
	},
};