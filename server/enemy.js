let p2        = require('p2');
let world     = require('./handlers/world.js');
let socket    = require('./socket.js');
let constants = require('./constants.js');
let rMath     = require('./rmath.js');

class Enemy
{
	static opposeBodies = new Set([constants.PLAYER, constants.BLOCK]);

	constructor(type, room)
	{
		this.id                 = 'enemy-' + rMath.rand(100000, 999999);
		this.room               = room;
		this.maxSpeed           = constants.ENEMYTYPE[type].maxSpeed;
		this.hp                 = constants.ENEMYTYPE[type].hp;
		this.damage             = constants.ENEMYTYPE[type].damage;
		this.type               = type;
		this.initiateAttack     = false;
		this.attackDelayCounter = 0;
		this.angle              = 0;
		this.target             = null;
		this.lastTargetDmg      = 0;
		this.dead               = false;

		let initPos = constants.ENEMIESSPAWNPOINTS[rMath.rand(0,2)];

		this.body = new p2.Body({
			mass: 1,
			position:
			[
				rMath.rand(initPos.minX, initPos.maxX),
				rMath.rand(initPos.minY, initPos.maxY)
			],
			id: `${this.id}$${this.room}`
		});

		let enemyshape = new p2.Box({width: 64, height: 64});
		enemyshape.collisionGroup = constants.ENEMY;
		enemyshape.collisionMask  = constants.PLAYER | constants.BLOCK | constants.BULLET | constants.ENEMY;
		this.body.addShape(enemyshape);
		world.addBody(this.body);
	}
	// начало атаки
	initAttack(target)
	{
		this.initiateAttack = true;
		this.target = target;
	}
	// получение урона
	decreaseHp(dmg, player)
	{
		if (dmg > this.lastTargetDmg)
		{
			this.target = player;
			this.lastTargetDmg = dmg;
		}
		this.hp -= dmg;
		if (this.hp <= 0)
		{
			this.dead = true;
			world.removeBody(this.body);
			return true;
		}

		return false;
	}
	// остановка
	stopVelocity()
	{
		this.body.velocity[0] = this.body.velocity[1] = 0;
	}
	update(playerList)
	{
		if (!this.target || !(this.target.id in playerList) || this.target.dead)
			this.updateTarget(playerList);

		this.updateVelocity();
		this.checkWorldBounds();
		this.updateAngle();
		this.updateAttack();
	}
	// обновить атаку
	updateAttack()
	{
		if (!this.initiateAttack)
			return;

		this.attackDelayCounter++;

		if (this.attackDelayCounter >= constants.ENEMYHITDELAY)
		{
			if (rMath.distanceTo(this.body.position, this.target.body.position) <= constants.ENEMYHITRADIUS)
			{
				this.stopVelocity();
				this.target.decreaseHealth(this.damage);
			}

			this.attackDelayCounter = 0;
		}
	}
	// обновление цели
	updateTarget(playerList)
	{
		if (!playerList || !Object.keys(playerList).length)
		{
			this.target = {};
			return;
		}

		for (let playerId in playerList)
			if ((!this.target
				|| this.target.dead
				|| !~this.target.distance
				|| rMath.distanceTo(playerList[playerId].body.position, playerList[playerId].body.position) < this.target.distance)
				&& !playerList[playerId].dead)
				this.target = playerList[playerId];
	}
	// проверка на нарушение границ
	checkWorldBounds()
	{
		if (this.body.position[0] < 64)
			this.body.position[0] = 64;
		if (this.body.position[0] > constants.WORLDWIDTH - 64)
			this.body.position[0] = constants.WORLDWIDTH - 64;
		if (this.body.position[1] < 64)
			this.body.position[1] = 64;
		if (this.body.position[1] > constants.WORLDHEIGHT - 64)
			this.body.position[1] = constants.WORLDHEIGHT - 64;
	}
	// обновление скорости
	updateVelocity()
	{
		let trX = 0,
			trY = 0;

		if (!this.toPosX && !this.toPosY)
		{
			this.toPosX = rMath.rand((constants.WORLDWIDTH / 4), (constants.WORLDWIDTH / 4) * 3);
			this.toPosY = rMath.rand((constants.WORLDHEIGHT / 4), (constants.WORLDHEIGHT / 4) * 3);
		}
		if (this.target && !this.target.dead)
		{
			trX = this.target.body.position[0];
			trY = this.target.body.position[1];

			this.toPosX = 0;
			this.toPosY = 0;
		}
		else if (Math.round(this.body.position[0]/10) === Math.round(this.toPosX/10)
		&& Math.round(this.body.position[1]/10) === Math.round(this.toPosY/10))
		{
			this.toPosX = trX = rMath.rand(256, (constants.WORLDWIDTH - 256));
			this.toPosY = trY = rMath.rand(256, (constants.WORLDHEIGHT - 256));
		}
		else
		{
			trX = this.toPosX;
			trY = this.toPosY;
		}

		if(trX > this.body.position[0])
			this.body.velocity[0] = this.maxSpeed;
		else if(trX < this.body.position[0])
			this.body.velocity[0] = -this.maxSpeed;
		else
			this.body.velocity[0] = 0;

		if(trY < this.body.position[1])
			this.body.velocity[1] = -this.maxSpeed;
		else if(trY > this.body.position[1])
			this.body.velocity[1] = this.maxSpeed;
		else
			this.body.velocity[1] = 0;
	}
	// поворот вслед за игроком
	updateAngle()
	{
		let x = 0,
			y = 0;
		if (this.target && !this.target.dead)
		{
			x = this.target.body.position[0];
			y = this.target.body.position[1];
		}
		else
		{
			x = this.toPosX;
			y = this.toPosY;
		}

		let absAngle = Math.abs(Math.atan((y - this.body.position[1]) / (x - this.body.position[0])) * 180 / Math.PI);
		if(x > this.body.position[0] && y > this.body.position[1])
			this.angle = absAngle;
		else if (x < this.body.position[0] && y > this.body.position[1])
			this.angle = -180 - absAngle;
		else if (x < this.body.position[0] && y < this.body.position[1])
			this.angle = -180 + absAngle;
		else
			this.angle = -absAngle;
	}
}

module.exports = Enemy;