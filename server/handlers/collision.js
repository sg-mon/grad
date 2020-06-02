let p2        = require('p2');
let world     = require('./world.js');
let constants = require('../constants.js');
let Player    = require('../player.js');
let Enemy     = require('../enemy.js');
let Bonus     = require('../bonus.js');
// let Block = require('../block.js');

function orStatementHelper(bodyA, bodyB, value)
{
	return bodyA.shapes[0].collisionGroup === value || bodyB.shapes[0].collisionGroup === value;
}

function bodyAssignment(bodyA, bodyB, value)
{
	let primaryBody,
		otherBody;

	if (bodyA.shapes[0].collisionGroup === value)
	{
		primaryBody = bodyA;
		otherBody = bodyB;
	}
	else
	{
		primaryBody = bodyB;
		otherBody = bodyA;
	}

	return [primaryBody, otherBody];
}

world.on("beginContact",function(e)
{
	let bodyA = e.bodyA,
		bodyB = e.bodyB;

	let bodiesArray;

	let primaryBody,
		otherBody;

	if (bodyA.shapes[0].collisionGroup !== bodyB.shapes[0].collisionGroup)
	{
		//If enemy
		if (orStatementHelper(bodyA, bodyB, constants.ENEMY))
		{
			bodiesArray = bodyAssignment(bodyA, bodyB, constants.ENEMY);
			primaryBody = bodiesArray[0];
			otherBody   = bodiesArray[1];
			
			//Check if otherBody is a valid target (in list of valid targets)
			if (Enemy.opposeBodies.has(otherBody.shapes[0].collisionGroup))
			{
				try
				{
					/*
					if (otherBody.shapes[0].collisionGroup === constants.PLAYER)
					{
						Player.list[playerBody.id].inContactWithEnemy = true; 
					}
					*/// Just in case we still need this
					Enemy.wave[primaryBody.id].initAttack(otherBody.id);
				}
				catch(error)
				{
					console.log(error);
				}
			}
		}
		//If player
		else if (orStatementHelper(bodyA, bodyB, constants.PLAYER))
		{
			bodiesArray = bodyAssignment(bodyA, bodyB, constants.PLAYER);
			primaryBody = bodiesArray[0];
			otherBody   = bodiesArray[1];
		}
		//If block
		else if (orStatementHelper(bodyA, bodyB, constants.BLOCK))
		{
			bodiesArray = bodyAssignment(bodyA, bodyB, constants.BLOCK);
		}
	}
});

world.on("endContact",function(e)
{
	let bodyA = e.bodyA,
		bodyB = e.bodyB;
	//If player
	if(bodyA.shapes[0].collisionGroup === constants.PLAYER || bodyB.shapes[0].collisionGroup === constants.PLAYER)
	{
		let playerBody, otherBody;
		if (bodyA.shapes[0].collisionGroup === constants.PLAYER)
		{
			playerBody = bodyA;
			otherBody = bodyB;
		}
		else
		{
			playerBody = bodyB;
			otherBody = bodyA;
		}

		//If player hit enemy
		if (otherBody.shapes[0].collisionGroup === constants.ENEMY)
		{
			try
			{
				Player.list[playerBody.id].inContactWithEnemy = false;
			}
			catch(error)
			{
				console.log("Player left while being attacked");
			}
		}
	}
});

let CollisionHandler =
{
	update()
	{
		CollisionHandler.updateBonuses();
	},
	checkOverlap(p1, p2, s1, s2)
	{
		if(p1[0] + s1[0] < p2[0] - s2[0])
			return false;
		if(p1[0] - s1[0] > p2[0] + s2[0])
			return false;

		if(p1[1] + s1[1] < p2[1] - s2[1])
			return false;

		if(p1[1] - s1[1] > p2[1] + s2[1])
			return false;

		return true;
	},
	updateBonuses()
	{
		for(let i in Bonus.list)
		{
			let item     = Bonus.list[i],
				itempos  = item.position,
				itemsize = [constants.BONUSSIZE, constants.BONUSSIZE];

			for(let j in Player.list)
			{
				let player     = Player.list[j],
					playerpos  = player.body.position,
					playersize = [constants.PLAYERSIZE, constants.PLAYERSIZE];

				if(CollisionHandler.checkOverlap(playerpos, itempos, playersize, itemsize))
				{
					try
					{
						if(item.type === 'rifleammo')
							player.inventory.rifle.ammo   += item.quantity;
						else if (item.type === 'shotgunammo')
							player.inventory.shotgun.ammo += item.quantity;
						else if (item.type === 'sniperammo')
							player.inventory.sniper.ammo  += item.quantity;
						else if (item.type === 'cure')
							player.hp += 20;
						item.destroy();
					}
					catch(error)
					{
						console.log(error);
					}
				}
			}
		}
	}
};
module.exports = CollisionHandler;