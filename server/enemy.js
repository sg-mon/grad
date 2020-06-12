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
		this.maxSpeed           = rMath.rand(constants.ENEMYTYPE[type].maxSpeed-15, constants.ENEMYTYPE[type].maxSpeed);
		this.hp                 = constants.ENEMYTYPE[type].hp;
		this.damage             = constants.ENEMYTYPE[type].damage;
		this.type               = type;
		this.initiateAttack     = false;
		this.attackDelayCounter = 0;
		this.angle              = 0;
		this.target             = '';
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

		this.updateTarget();
	}
	initAttack(target)
	{
		this.attackDelayCounter ++;	
		if (this.attackDelayCounter >= constants.ENEMYHITDELAY)
		{
			if (rMath.distanceTo(this.body.position, target.body.position) <= constants.ENEMYHITRADIUS)
				target.decreaseHealth(this.damage);

			this.attackDelayCounter = 0;
			this.initiateAttack = false;
		}
	}
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
		// this.body.velocity = [this.body.velocity[0]*-1, this.body.velocity[1]*-1];
		return false;
	}
	stopVelocity()
	{
		this.body.velocity[0] = this.body.velocity[1] = 0;
	}
	update(playerList)
	{
		if (!this.target || !playerList[this.target] || playerList[this.target].dead)
			this.updateTarget(playerList);


		if (!this.target || !playerList[this.target] || playerList[this.target].dead)
		{
			this.stopVelocity();
			return;
		}

		this.updateVelocity(playerList);
		this.checkWorldBounds();
		this.updateAngle(playerList);
	}
	updateTarget(playerList)
	{
		if (!playerList || !Object.keys(playerList).length)
		{
			this.target = '';
			return;
		}

		let currentTarget =
		{
			id: '',
			position: {},
			distance: -1
		};

		for (let playerId in playerList)
		{
			if ((!~currentTarget.distance ||
				rMath.distanceTo(playerList[playerId].body.position, playerList[playerId].body.position) < currentTarget.distance)
				&& !playerList[playerId].dead)
			currentTarget =
			{
				position: playerList[playerId].body.position,
				id: playerList[playerId].id,
				distance: rMath.distanceTo(this.body.position, playerList[playerId].body.position)
			};
		}

		this.target = currentTarget.id;
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
	updateVelocity(playerList)
	{
		if(playerList[this.target].body.position[0] > this.body.position[0])
			this.body.velocity[0] = this.maxSpeed;
		else if(playerList[this.target].body.position[0] < this.body.position[0])
			this.body.velocity[0] = -this.maxSpeed;
		else
			this.body.velocity[0] = 0;

		if(playerList[this.target].body.position[1] < this.body.position[1])
			this.body.velocity[1] = -this.maxSpeed;
		else if(playerList[this.target].body.position[1] > this.body.position[1])
			this.body.velocity[1] = this.maxSpeed;
		else
			this.body.velocity[1] = 0;
	}
	updateAngle(playerList)
	{
		let x = playerList[this.target].body.position[0],
			y = playerList[this.target].body.position[1];


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