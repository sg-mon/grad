exports.INVENTORYDATA = {
	rifle:
	{
		name: "rifle",
		ammo: 40,
		cooldown: 8,
		initial: true,
	},
	shotgun:
	{
		name: "shotgun",
		ammo: 20,
		cooldown: 30,
		initial: true,
	},
	sniper:
	{
		name: "sniper",
		ammo: 10,
		cooldown: 50,
		initial: true,
	}
	
};
exports.PLAYERSIZE  = 64;
exports.RIFLEDAMAGE = 30;
exports.SHOTGUNDAMAGE = 15;
exports.SNIPERDAMAGE = 40;
exports.RESPAWNTIME = 360;

// коллизии
exports.PLAYER     = Math.pow(2,0);
exports.ENEMY      = Math.pow(2,1);
exports.BULLET     = Math.pow(2,2);
exports.BLOCK      = Math.pow(2,3);
exports.BONUS      = Math.pow(2,4);
// карта
exports.WORLDHEIGHT = 2048;
exports.WORLDWIDTH = 2048;

exports.ENEMIESSPAWNPOINTS =
[
	{
		minX: 0,
		maxX: 256,
		minY: this.WORLDHEIGHT - 256,
		maxY: this.WORLDHEIGHT,
	},
	{
		minX: this.WORLDWIDTH - 256,
		maxX: this.WORLDWIDTH,
		minY: 0,
		maxY: 256,
	},
	{
		minX: this.WORLDWIDTH - 256,
		maxX: this.WORLDWIDTH,
		minY: this.WORLDHEIGHT - 256,
		maxY: this.WORLDHEIGHT,
	}
];

exports.ENEMYTYPE =
{
	common:
	{
		hp: 100,
		maxSpeed: 120,
		damage: 10,
	},
	medium:
	{
		hp: 400,
		maxSpeed: 190,
		damage: 50,
	},
};

// мир
exports.ENEMYHITDELAY = 2;
exports.ENEMYHITRADIUS = 70;
exports.BONUSSIZE = 4;
exports.MAXBONUSCOUNT = 5;

exports.GAME =
{
	easy:
	{
		waves:[{common:8,medium:0},{common:12,medium:0},{common:16,medium:0},{common:26,medium:0},]
	},
	medium:
	{
		waves:[{common:16,medium:0},{common:20,medium:0},{common:26,medium:0},{common:32,medium:1},{common:36,medium:2}]
	},
	difficult:
	{
		waves:[{common:20,medium:0},{common:26,medium:0},{common:32,medium:1},{common:38,medium:2},{common:44,medium:3},{common:50,medium:4}]
	},
	nightmare:
	{
		waves:[{common:32,medium:2},{common:40,medium:4},{common:46,medium:8},{common:50,medium:8},{common:58,medium:8},{common:64,medium:8},{common:70,medium:16}]
	},
};