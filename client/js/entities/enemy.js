export class Enemy
{
	static wave  = {};
	static group = null;
	static createEnemy(data)
	{
		new Enemy(data.id, data.position);
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
	static updateAllPositions()
	{
		for (let id in Enemy.wave)
			Enemy.wave[id].updatePositions();
	}
	static onInitialJoinPopulateEnemies(data)
	{
		for(let id in data)
			if(!(id in Enemy.wave))
				new Enemy(id, data[id].position);
	}
	constructor(id, pos)
	{
		this.id = id;
		this.gameObj = Enemy.group.create(pos[0], pos[1], 'enemy');
		this.gameObj.anchor.x = 0.5;
		this.gameObj.anchor.y = 0.5;
		this.x = pos[0];
		this.y = pos[1];
		this.angle = 0;

		Enemy.wave[id] = this;
	}
	update(data)
	{
		this.x = data.position[0];
		this.y = data.position[1];

		this.hp = data.hp; 

		this.gameObj.angle = this.gameObj.targetAngle = data.angle;
	}
	updatePositions()
	{
		this.gameObj.x = this.x;
		this.gameObj.y = this.y;
	}
}