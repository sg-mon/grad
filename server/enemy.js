let p2        = require('p2');
let world     = require('./handlers/world.js');
let socket    = require('./socket.js');
let constants = require('./constants.js');
let rMath     = require('./rmath.js');

class Enemy
{
	// static opposeBodies = new Set([constants.PLAYER, constants.BLOCK]);
	static destroy(id)
	{
		world.removeBody(this.wave[id].body);
		delete this.wave[id];
		socket.emitAll('removeEnemy', id);
	}
	constructor()
	{
		this.id = 'enemy-' + rMath.rand(100000, 999999);

		this.maxSpeed = rMath.rand(70, 80);
		this.hp = 100;
		this.initiateAttack = false;
		this.attackDelayCounter = 0;
		this.angle = 0;
		this.target = '';
		this.lastTargetDmg = 0;

		let initPos = constants.ENEMIESSPAWNPOINTS[rMath.rand(0,2)];

		this.body = new p2.Body({
			mass: 1,
			position:
			[
				rMath.rand(initPos.minX, initPos.maxX),
				rMath.rand(initPos.minY, initPos.maxY)
			],
			id: this.id
		});

		let enemyshape = new p2.Box({width: 64, height: 64});
		enemyshape.collisionGroup = constants.ENEMY;
		enemyshape.collisionMask  = constants.PLAYER | constants.BLOCK | constants.BULLET | constants.ENEMY;
		this.body.addShape(enemyshape);
		world.addBody(this.body);

		this.updateTarget();
	}
	initAttack(id)
	{
		this.initiateAttack = true;
		this.target = id;
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
			Enemy.destroy(this.id);
			return true;
		}
		// this.body.velocity = [this.body.velocity[0]*-1, this.body.velocity[1]*-1];
		console.log('decreaseHp(dmg, player)', dmg, player);
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
		this.updateAngle(playerList);
		this.updateAttack(playerList);
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
	updateAttack(playerList)
	{

		if (this.initiateAttack)
		{
			this.attackDelayCounter ++;	
			if (this.attackDelayCounter >= constants.ENEMYHITDELAY)
			{
				
				let playerBody = playerList[this.target];
				if (rMath.distanceTo(this.body.position, playerBody.body.position) <= constants.ENEMYHITRADIUS)
				{
					playerBody.decreaseHealth(constants.ENEMYDAMAGE);
				}
				//add more else ifs for zombies hitting other things but refactoring and restructuring is heavily recommended
				this.attackDelayCounter = 0;
				this.initiateAttack = false;
			}
		}
	}
}

module.exports = Enemy;