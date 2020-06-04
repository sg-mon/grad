let p2        = require('p2');
let world     = require('./world.js');
let constants = require('../constants.js');
let rMath     = require('../rmath.js');
let socketio  = require('../socket.js').io;
let Enemy     = require('../enemy.js');

let GunHandler =
{
	rifleShoot(room, angle, position, id)
	{
		let distance = 800;
		let startx = position[0] + 50*Math.cos(angle/180*Math.PI);
		let starty = position[1] + 50*Math.sin(angle/180*Math.PI);
		let killedEnemy = false;

		let ray = new p2.Ray({
			mode: p2.Ray.CLOSEST, // or ANY
			from: [startx, starty],
			to: [position[0]+distance*Math.cos(angle/180*Math.PI), position[1]+distance*Math.sin(angle/180*Math.PI)],
		});

		let result = new p2.RaycastResult();
		world.raycast(result, ray);

		if(result.body !== null && result.body.shapes[0].collisionGroup === constants.ENEMY)
			if(Enemy.wave[result.body.id])
				killedEnemy = Enemy.wave[result.body.id].decreaseHp(constants.RIFLEDAMAGE, id);

		let length = Math.abs(result.getHitDistance(ray));
		socketio.of('/pve').to(room).emit('createGunShot', {startx: startx, starty: starty, angle: angle, length: length});
		return killedEnemy;
	}

};

module.exports = GunHandler;