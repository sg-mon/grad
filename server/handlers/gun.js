let p2        = require('p2');
let world     = require('./world.js');
let constants = require('../constants.js');
let rMath     = require('../rmath.js');
let socketio  = require('../socket.js').io;
let RoomList  = null;
setTimeout(()=>
{
	RoomList = require('../room.js').list;
},1);
let GunHandler =
{
	rifleShoot(room, angle, position, id)
	{
		let distance = 800,
			startx = position[0] + 50*Math.cos(angle/180*Math.PI),
			starty = position[1] + 50*Math.sin(angle/180*Math.PI),
			killedEnemy = false;

		let ray = new p2.Ray({
			mode: p2.Ray.CLOSEST, // or ANY
			from: [startx, starty],
			to: [position[0]+distance*Math.cos(angle/180*Math.PI), position[1]+distance*Math.sin(angle/180*Math.PI)],
		});

		let result = new p2.RaycastResult();
		world.raycast(result, ray);

		if(result.body !== null && result.body.shapes[0].collisionGroup === constants.ENEMY)
		{
			let enemyId = result.body.id.match(/^(.+?)\$/)[1];
			if (RoomList[room].enemies.list[enemyId])
				killedEnemy = RoomList[room].enemies.list[enemyId].decreaseHp(constants.RIFLEDAMAGE, RoomList[room].players.list[id]);
		}


		let length = Math.abs(result.getHitDistance(ray));
		socketio.of('/pve').to(room).emit('createGunShot', {startx: startx, starty: starty, angle: angle, length: length});
		return killedEnemy;
	},
	shotgunShoot(room, angle, position, id)
	{
		let distance = 500;
		let startx = position[0] + 50*Math.cos(angle/180*Math.PI);
		let starty = position[1] + 50*Math.sin(angle/180*Math.PI);
		let killedEnemy = false;

		for(let offset = -6; offset <= 6; offset+=3)
		{
			killedEnemy = false;
			let newAngle = angle + offset;
			let ray = new p2.Ray({
				mode: p2.Ray.CLOSEST, // or ANY
				from: [startx, starty],
				to: [position[0]+distance*Math.cos(newAngle/180*Math.PI), position[1]+distance*Math.sin(newAngle/180*Math.PI)],
			});
			let result = new p2.RaycastResult();
			world.raycast(result, ray);

			// Get the hit point
			let hitPoint = p2.vec2.create();
			result.getHitPoint(hitPoint, ray);

	
			if(result.body !== null && result.body.shapes[0].collisionGroup === constants.ENEMY)
			{
				let enemyId = result.body.id.match(/^(.+?)\$/)[1];
				if (RoomList[room].enemies.list[enemyId])
					killedEnemy = RoomList[room].enemies.list[enemyId].decreaseHp(constants.SHOTGUNDAMAGE, RoomList[room].players.list[id]);
			}

			let length = Math.abs(result.getHitDistance(ray));
			socketio.of('/pve').to(room).emit('createGunShot', {startx: startx, starty: starty, angle: newAngle, length: length});
		}

		return killedEnemy;
	},
	sniperShoot(room, angle, position, id)
	{
		let distance = 1000,
			startx = position[0] + 50*Math.cos(angle/180*Math.PI),
			starty = position[1] + 50*Math.sin(angle/180*Math.PI),
			killedEnemy = false;

		let ray = new p2.Ray({
			mode: p2.Ray.CLOSEST, // or ANY
			from: [startx, starty],
			to: [position[0]+distance*Math.cos(angle/180*Math.PI), position[1]+distance*Math.sin(angle/180*Math.PI)],
		});

		let result = new p2.RaycastResult();
		world.raycast(result, ray);

		if(result.body !== null && result.body.shapes[0].collisionGroup === constants.ENEMY)
		{
			let enemyId = result.body.id.match(/^(.+?)\$/)[1];
			if (RoomList[room].enemies.list[enemyId])
				killedEnemy = RoomList[room].enemies.list[enemyId].decreaseHp(constants.SNIPERDAMAGE, RoomList[room].players.list[id]);
		}


		let length = Math.abs(result.getHitDistance(ray));
		socketio.of('/pve').to(room).emit('createGunShot', {startx: startx, starty: starty, angle: angle, length: length});
		return killedEnemy;
	},
};

module.exports = GunHandler;