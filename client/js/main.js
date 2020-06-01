"use strict"

$(document).ready(function()
{
	rin.init();
});

let rin =
{
	slickUI: null,
	async init()
	{
		// await this.preload.start();
		// this.preload.stop();
	},
	async initGame()
	{
		await this.preload.start();
		$('._no-game').each(function(ind)
		{
			$(this).addClass('hide');
		});

		$('.game-wr').removeClass('hide');

		await this.impInit();
		await this.game.init();
		this.winManager.init();
	},
	async impInit()
	{
		this.winManager = await import('./modules/winManager.js');
		this.winManager = this.winManager.winManager;

		this.PlayerClass = await import('./entities/player.js');
		this.PlayerClass = this.PlayerClass.Player;

		this.EnemyClass = await import('./entities/enemy.js');
		this.EnemyClass = this.EnemyClass.Enemy;

		this.LineDrawer = await import('./entities/linedrawer.js');
		this.LineDrawer = this.LineDrawer.LineDrawer;

		return Promise.resolve();
	},
	preload:
	{
		start()
		{
			loading_screen = pleaseWait({
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
				// else if (e.keyCode >= 49 && e.keyCode <= 57) //1-9
					// rin.player.changeInventory(e.keyCode - 48); //Adjusting to 1-5
					// rin.socket.ins.on('changeInventory', e.keyCode - 48);

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
			if (rin.game.ins.input.activePointer.leftButton.isDown)
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
	game:
	{
		ins:   null,
		map:   null,
		layer: null,
		start: false,
		currentPlayer: null,
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
			this.load.image('enemy', '/assets/enemy-common-1.png');

			// TILESET
			this.load.tilemap('map', '/assets/map/map.csv');
			this.load.image('tiles', '/assets/map/map-tileset.png');
			// user interface
			rin.slickUI = rin.game.ins.plugins.add(Phaser.Plugin.SlickUI);
			rin.slickUI.load('/assets/UI/kenney.json');
		},
		create()
		{
			this.game.world.setBounds(200, 20, 1440, 900);
			this.game.map = this.add.tilemap('map', 64, 64);
			this.game.map.addTilesetImage('tiles');
			// bg layer
			this.game.layer = this.game.map.createLayer(0);
			this.game.layer.resizeWorld();
			this.game.layer.position.set(1, 1);

			this.game.time.advancedTiming = true;
			this.game.stage.disableVisibilityChange = true;
			this.game.stage.backgroundColor = '#95BCC7';
			this.game.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
			this.game.physics.startSystem(Phaser.Physics.P2JS);
			this.game.input.mouse.capture = true;

			rin.PlayerClass.group = this.game.add.group();
			rin.EnemyClass.group  = this.game.add.group();
			rin.LineDrawer.group  = this.game.add.group();

			rin.winManager.createUI();

			rin.socket.init();
		},
		initCurrentPlayer(id)
		{
			this.currentPlayer = new rin.PlayerClass(id, true);
		},
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
		update()
		{
			rin.inputHandler.updateMouseDown();
			rin.LineDrawer.updateAll();
			rin.winManager.update();
			rin.PlayerClass.updateAllPositions();
			rin.EnemyClass.updateAllPositions();
		},
	},
	socket:
	{
		ins: null,
		init()
		{
			this.ins = io();
			this.ins.on('connect', ()=>
			{
				rin.game.initCurrentPlayer(this.ins.id);
				this.ins.on('newPlayer', rin.PlayerClass.addNewPlayer);
				this.ins.on('playerDisconnect', rin.PlayerClass.removePlayer);
				this.ins.on('onInitialJoinPopulatePlayers', rin.PlayerClass.onInitialJoinPopulatePlayers);
				this.ins.on('onInitialJoinPopulateEnemies', rin.EnemyClass.onInitialJoinPopulateEnemies);

				this.ins.on('updateClientOnPlayers', rin.PlayerClass.updateAll);
				this.ins.on('updateClientOnEnemies', rin.EnemyClass.updateAll);
				this.ins.on('createEnemy', rin.EnemyClass.createEnemy);
				this.ins.on('removeEnemy', rin.EnemyClass.removeEnemy);

				// 
				this.ins.on('createGunShot', rin.GunHandler.createGunShot);

				rin.game.ins.camera.follow(rin.game.currentPlayer.gameObj, Phaser.Camera.FOLLOW_TOPDOWN, 0.1, 0.1);
				rin.game.ins.time.events.loop(100, rin.socket.updateServer, this);
				rin.game.start = true;

				rin.inputHandler.init();	
			});
			rin.preload.stop();
		},
		updateServer()
		{
			this.ins.emit('updateServer', {inputs: rin.inputHandler.inputs, angle: rin.game.currentPlayer.gameObj.angle});
		}
	},
	GunHandler:
	{
		createGunShot(data)
		{
			let endx = data.startx + data.length*Math.cos(data.angle/180*Math.PI),
				endy = data.starty + data.length*Math.sin(data.angle/180*Math.PI),
				graphics = new rin.LineDrawer().graphics;

			graphics.moveTo(data.startx, data.starty);
			graphics.lineTo(endx, endy);
		},
		useRequest()
		{
			let x = rin.game.ins.input.mousePointer.x + rin.game.ins.camera.x,
				y = rin.game.ins.input.mousePointer.y + rin.game.ins.camera.y;
			rin.socket.ins.emit('useRequest', [x,y]);
		}
	},
	// cookie:
	// {
	// 	getCookie: function(name) {
	// 		var matches = document.cookie.match(new RegExp(
	// 			"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	// 		));
	// 		return matches ? decodeURIComponent(matches[1]) : undefined;
	// 	},
	// 	setCookie: function(name, value, options)
	// 	{
	// 		selectionOptions = options || {};

	// 		var expires = options.expires;

	// 		if (typeof expires == "number" && expires) {
	// 			var d = new Date();
	// 			d.setTime(d.getTime() + expires * 1000);
	// 			expires = options.expires = d;
	// 		}
	// 		if (expires && expires.toUTCString) {
	// 			options.expires = expires.toUTCString();
	// 		}

	// 		value = encodeURIComponent(value);

	// 		var updatedCookie = name + "=" + value;

	// 		for (var propName in options) {
	// 			updatedCookie += "; " + propName;
	// 			var propValue = options[propName];
	// 			if (propValue !== true) {
	// 				updatedCookie += "=" + propValue;
	// 			}
	// 		}
	// 		document.cookie = updatedCookie;
	// 	}
	// },
};