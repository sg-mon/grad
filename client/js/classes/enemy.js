class Enemy
{
	static wave  = {};
	static group = null;
	static destroyAll()
	{
		for (let id in Enemy.wave)
		{
			Enemy.wave[id].gameObj.kill();
			delete Enemy.wave[id];
		}
	}
	static createEnemy(data)
	{
		if(!(data.id in Enemy.wave))
			new Enemy(data.id, data.position, data.type);
	}
	static removeEnemy(id)
	{
		if (!Enemy.wave[id])
			return;

		Enemy.wave[id].gameObj.kill();
		delete Enemy.wave[id];
	}
	static updateAll(data)
	{
		for (let id in data)
			if (Enemy.wave[id])
				Enemy.wave[id].update(data[id]);
	}
	static onInitialJoinPopulateEnemies(data)
	{
		for(let id in data)
			if(!(id in Enemy.wave))
				new Enemy(id, data[id].position);
	}
	constructor(id, pos, type)
	{
		this.id = id;
		this.type = type;

		this.gameObj = Enemy.group.create(pos[0] ? -500 : pos[0], pos[1] ? -500 : pos[1], 'enemy-' + this.type + '-' + Math.floor(Math.random() * 2 + 1));
		this.gameObj.anchor.x = 0.5;
		this.gameObj.anchor.y = 0.5;
		this.angle = 0;

		Enemy.wave[id] = this;
	}
	update(data)
	{
		this.gameObj.x = data.position[0];
		this.gameObj.y = data.position[1];

		this.hp = data.hp; 

		this.gameObj.angle = this.gameObj.targetAngle = data.angle;
	}
}