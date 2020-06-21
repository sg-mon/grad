// данные инвентаря
exports.INVENTORYDATA = {
	rifle:{name: "rifle",ammo: 40,cooldown: 8},
	shotgun:{name: "shotgun",ammo: 20,cooldown: 30},
	sniper:{name: "sniper",ammo: 10,cooldown: 50}
};
// размер игрока
exports.PLAYERSIZE  = 64;
// урон от разных видов оружия
exports.RIFLEDAMAGE = 30;
exports.SHOTGUNDAMAGE = 15;
exports.SNIPERDAMAGE = 60;
exports.RESPAWNTIME = 360;
// данные о коллизиях
exports.PLAYER     = Math.pow(2,0);
exports.ENEMY      = Math.pow(2,1);
exports.BULLET     = Math.pow(2,2);
exports.BLOCK      = Math.pow(2,3);
exports.BONUS      = Math.pow(2,4);
// карта, высота и ширина
exports.WORLDHEIGHT = 2048;
exports.WORLDWIDTH = 2048;
// точки генерации противников
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
// данные о типах противников
exports.ENEMYTYPE =
{
	common:{hp: 100,maxSpeed: 120,damage: 10},
	medium:{hp: 400,maxSpeed: 190,damage: 50},
};
// задержка перед нанесением урона противника
exports.ENEMYHITDELAY = 1;
exports.ENEMYHITRADIUS = 70;
// размер бонуса
exports.BONUSSIZE = 4;
// максимальное количество одновременно существущих бонусов в комнате
exports.MAXBONUSCOUNT = 10;
// данные о волнах противников (тип, количество) при разном уровне сложности
exports.GAME =
{
	easy:{waves:[{common:8,medium:0},{common:12,medium:0},{common:16,medium:0},{common:26,medium:0},]},
	medium:{waves:[{common:16,medium:0},{common:20,medium:0},{common:26,medium:0},{common:32,medium:1},{common:36,medium:2}]},
	difficult:{waves:[{common:20,medium:0},{common:26,medium:0},{common:32,medium:1},{common:38,medium:2},{common:44,medium:3},{common:50,medium:4}]},
	nightmare:{waves:[{common:32,medium:2},{common:40,medium:4},{common:46,medium:8},{common:50,medium:8},{common:58,medium:8},{common:64,medium:8},{common:70,medium:16}]},
};