let p2        = require('p2');
let world     = require('./handlers/world.js');
let socket    = require('./socket.js');
let constants = require('./constants.js');
let rMath     = require('./rmath.js');

class Bonus
{
	constructor(category, type, position, quantity)
	{
		this.id       = rMath.rand(100000, 999999);
		this.category = category;
		this.type     = type;
		this.quantity = quantity;
		this.position = position;
		this.hitbox   = [constants.BONUSSIZE, constants.BONUSSIZE];
		this.dead     = false;
	}
	destroy()
	{
		this.dead = true;
	}
}
module.exports = Bonus;