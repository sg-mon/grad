// для игрока
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
		cooldown: 20,
		initial: true,
	},
	sniper:
	{
		name: "sniper",
		ammo: 10,
		cooldown: 40,
		initial: true,
	}
};
exports.PLAYERSIZE  = 64;
exports.RIFLEDAMAGE = 30;
exports.RESPAWNTIME = 600;

// коллизии
exports.PLAYER     = Math.pow(2,0);
exports.ENEMY      = Math.pow(2,1);
exports.BULLET     = Math.pow(2,2);
exports.BLOCK      = Math.pow(2,3);
exports.BONUS      = Math.pow(2,4);

// карта
exports.WORLDHEIGHT = 1280;
exports.WORLDWIDTH = 2048;


// для противников
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
[
	{
		title: 'common',
		hp: 100,
		maxSpeed: 75,
		dps: 0
	},
	{
		title: 'medium',
		hp: 250,
		maxSpeed: 75,
		dps: 0
	},
	{
		title: 'hard',
		hp: 400,
		maxSpeed: 75,
		dps: 0
	}
];

// мир
exports.ENEMYHITDELAY = 2;
exports.ENEMYHITRADIUS = 70;
exports.ENEMYDAMAGE = 20;
exports.BONUSSIZE = 4;
exports.MAXBONUSCOUNT = 5;