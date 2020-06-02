let p2        = require('p2');
let world     = require('./handlers/world.js');
let socket    = require('./socket.js');
let constants = require('./constants.js');
let rMath     = require('./rmath.js');

class Bonus
{
	static list = {};

	static generateCurrentStatusPackage()
	{
		let pack = {};
		for(let i in this.list)
			pack[i] =
			{
				position: this.list[i].position,
				category: this.list[i].category,
				type:     this.list[i].type
			};

		return pack;
	}

	static randomSpawn()
	{
		if(Object.keys(Bonus.list).length >= constants.MAXBONUSCOUNT)
			return;

		let x        = Math.random() * constants.WORLDWIDTH,
			y        = Math.random() * constants.WORLDHEIGHT,
			type     = Math.ceil(Math.random() * 10),
			item;

		switch(type)
		{
			case 1:
			case 2:
				item = new Bonus('ammo', 'shotgunammo', [x, y], 8);
			break;
			case 3:
			case 4:
				item = new Bonus('ammo', 'sniperammo', [x, y], 4);
			break;
			case 5:
				item = new Bonus('cure', 'cure', [x, y], 16);
			break;
			default:
				item = new Bonus('ammo', 'rifleammo', [x, y], 16);
			break;
		}

		socket.emitAll('createBonus', item);
	}

	static onPlayerConnect(newSocket)
	{
		let pack = Bonus.generateCurrentStatusPackage();
		newSocket.emit('onInitialJoinPopulateBonus', pack);
	}

	constructor(category, type, position, quantity)
	{
		this.id       = rMath.rand(100000, 999999);
		this.category = category;
		this.type     = type;
		this.quantity = quantity;
		this.position = position;
		this.hitbox   = [constants.BONUSSIZE, constants.BONUSSIZE];
		// this.body = new p2.Body({
		// 	type: p2.Body.KINEMATIC,
		// 	position:position,
		//     id: this.id,
		// });
		// let bodyShape = new p2.Box({width:constants.BONUSSIZE, height:constants.BONUSSIZE});
		// bodyShape.collisionGroup = constants.BONUS;
		// bodyShape.collisionMask = constants.PLAYER;
		// this.body.addShape(bodyShape);
		// world.addBody(this.body);

		this.constructor.list[this.id] = this;
	}
	destroy()
	{
		delete this.constructor.list[this.id];
		socket.emitAll('destroyBonus', this.id);
	}
}
module.exports = Bonus;