let p2         = require('p2');
let world      = require('./handlers/world.js');
let GunHandler = require('./handlers/gun.js');
let constants  = require('./constants.js');
let socketio  = require('./socket.js').io;

class Player
{
	constructor(socket, namespace, room)
	{
		this.id     = socket.id;
		this.socket = socket;
		this.hp     = 100;
		this.dead   = false;
		this.angle  = 0;
		this.speed  = 200;

		this.room                  = room;
		this.namespace             = namespace;
		this.respawnTimer          = 0;
		this.justDamaged           = false;
		this.inContactWithEnemy    = false;
		this.kills                 = 0;
		this.damageCooldownCounter = 0;
		this.inventory = {};


		for (let inv in constants.INVENTORYDATA)
		{
			if (!constants.INVENTORYDATA[inv].initial)
				continue;

			this.inventory[inv] =
			{
				ammo: constants.INVENTORYDATA[inv].ammo,
				cooldown: constants.INVENTORYDATA[inv].cooldown,
				name: constants.INVENTORYDATA[inv].name,
			};
		}

		this.activeWeapon  = Object.keys(this.inventory)[0];
		this.inputs =
		{
			right: false,
			left:  false,
			down:  false,
			up:    false,
		};

		this.body = new p2.Body({
			mass: 1,
			position: [120,120],
			id: this.id,
		});

		let bodyShape = new p2.Box({width: constants.PLAYERSIZE, height: constants.PLAYERSIZE});
		bodyShape.collisionGroup = constants.PLAYER;
		bodyShape.collisionMask  = constants.ENEMY | constants.BLOCK | constants.PLAYER;
		this.body.addShape(bodyShape);
		world.addBody(this.body);
	}
	changeInventory(invInd)
	{
		if(invInd <= 0
			|| invInd > this.inventory.length - 1
			|| this.inventory[slotNumber] === null)
			return;

		this.activeWeapon = invInd;
	}

	useRequest()
	{
		if(this.dead)
			return;

		let activeWeapon = this.inventory[this.activeWeapon];
		if (activeWeapon && activeWeapon.ammo > 0 && activeWeapon.cooldown <= 0)
		{
			activeWeapon.ammo--;
			activeWeapon.cooldown = constants.INVENTORYDATA[activeWeapon.name].cooldown;
			if (GunHandler.rifleShoot(this.room, this.angle, this.body.position, this.id))
				this.kills++;
		}
	}
	updateRespawnTimer()
	{
		this.respawnTimer--;

		if(this.respawnTimer <= 0)
			this.respawn();
	}

	respawn()
	{
		this.hp            = 100;
		this.dead          = false;
		this.respawnTimer  = 0;

		for (let inv in constants.INVENTORYDATA)
		{
			if (!constants.INVENTORYDATA[inv].initial)
				continue;

			this.inventory[inv] =
			{
				ammo: constants.INVENTORYDATA[inv].ammo,
				cooldown: constants.INVENTORYDATA[inv].cooldown,
				name: constants.INVENTORYDATA[inv].name,
			};
		}

		this.body.position = [120, 120];
	}

	updateSpeed()
	{
		if(this.inputs.right)
			this.body.velocity[0] = this.speed;
		else if(this.inputs.left)
			this.body.velocity[0] = -this.speed;
		else
			this.body.velocity[0] = 0;

		if(this.inputs.up)
			this.body.velocity[1] = -this.speed;
		else if(this.inputs.down)
			this.body.velocity[1] = this.speed;
		else
			this.body.velocity[1] = 0;
	}

	checkWorldBounds()
	{
		if (this.body.position[0] <= 32) 
			if (this.body.velocity[0] < 0)
				this.body.velocity[0] = 0;
		if (this.body.position[0] >= constants.WORLDWIDTH - 32)
			if (this.body.velocity[0] > 0)
				this.body.velocity[0] = 0;
		if (this.body.position[1] <= 32)
			if (this.body.velocity[1] < 0) 
				this.body.velocity[1] = 0;
		if (this.body.position[1] >= constants.WORLDHEIGHT - 32)
			if (this.body.velocity[1] > 0)
				this.body.velocity[1] = 0;
	}

	updateDamage()
	{
		if(this.justDamaged)
			this.damageCooldownCounter++;

		else if (this.inContactWithEnemy)
			this.decreaseHealth();


		if(this.damageCooldownCounter > 30)
		{
			this.justDamaged = false;
			this.damageCooldownCounter = 0;
		}
	}

	die()
	{
		this.dead          = true;
		this.respawnTimer  = constants.RESPAWNTIME;
		this.body.velocity = [0,0];
		this.body.position = [120, -500];
		this.inputs.left  = false;
		this.inputs.right = false;
		this.inputs.up    = false;
		this.inputs.down  = false;

		socketio.of(this.namespace).to(this.room).emit('playerDeath', this.id);
	}

	decreaseHealth(dmg)
	{
		if(this.justDamaged)
			return;

		this.hp -= dmg;
		this.justDamaged = true;

		if(this.hp <= 0)
			this.die();
	}

	updateCooldowns()
	{
		for (let inv in this.inventory)
			if (this.inventory[inv].cooldown)
				this.inventory[inv].cooldown--;
	}

	update()
	{
		if(this.dead)
		{
			this.updateRespawnTimer();
			return;
		}

		this.updateSpeed();
		this.checkWorldBounds();
		this.updateDamage();
		this.updateCooldowns();
	}

	destroy()
	{
		world.removeBody(this.body);
	}
}

module.exports = Player;