let p2        = require('p2');
let world     = require('./world.js');
let constants = require('../constants.js');
let Player    = require('../player.js');
let Enemy     = require('../enemy.js');
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

	}
};
module.exports = CollisionHandler;