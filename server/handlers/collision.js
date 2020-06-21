let p2        = require('p2');
let world     = require('./world.js');
let constants = require('../constants.js');
let Player    = require('../player.js');
let Enemy     = require('../enemy.js');
let Room      = require('../room.js');

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
		if (orStatementHelper(bodyA, bodyB, constants.ENEMY))
		{
			bodiesArray = bodyAssignment(bodyA, bodyB, constants.ENEMY);
			primaryBody = bodiesArray[0];
			otherBody   = bodiesArray[1];
			
			if (Enemy.opposeBodies.has(otherBody.shapes[0].collisionGroup))
			{
				try
				{	
					let enemyId  = primaryBody.id.match(/^(.+?)\$/)[1],
						roomId   = primaryBody.id.match(/\$(.*?)$/)[1],
						playerId = otherBody.id.match(/^(.+?)\$/)[1];

					Room.list[roomId].enemies.list[enemyId].initAttack(Room.list[roomId].players.list[playerId]);
				}
				catch(error)
				{
					console.log(error);
				}
			}
		}
	}
});

world.on("endContact",function(e)
{
	let bodyA = e.bodyA,
		bodyB = e.bodyB;

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
		let roomId   = otherBody.id.match(/\$(.*?)$/)[1],
			playerId = playerBody.id.match(/^(.+?)\$/)[1];

		if (otherBody.shapes[0].collisionGroup === constants.ENEMY)
		{
			try
			{
				Room.list[roomId].players.list[playerId].inContactWithEnemy = false;
			}
			catch(error)
			{
				// console.log("\n\n\n\n\n\n\n\n\n", Room.list, roomId, playerId, "\n\n\n\n\n\n\n\n\n");
				console.log("Player left while being attacked",error);
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
		for(let roomId in Room.list)
			for (let bonusId in Room.list[roomId].bonuses.list)
			{
				let item     = Room.list[roomId].bonuses.list[bonusId],
					itempos  = item.position,
					itemsize = [constants.BONUSSIZE, constants.BONUSSIZE];

				for(let j in Room.list[roomId].players.list)
				{
					let player     = Room.list[roomId].players.list[j],
						playerpos  = player.body.position,
						playersize = [constants.PLAYERSIZE, constants.PLAYERSIZE];

					if(CollisionHandler.checkOverlap(playerpos, itempos, playersize, itemsize))
					{
						try
						{
							if(item.type === 'rifleammo')
								player.inventory.rifle.ammo += item.quantity;
							else if (item.type === 'shotgunammo')
								player.inventory.shotgun.ammo += item.quantity;
							else if (item.type === 'sniperammo')
								player.inventory.sniper.ammo += item.quantity;
							else if (item.type === 'cure')
							{
								player.hp += 20;
								if (player.hp > 100)
									player.hp = 100;
							}
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