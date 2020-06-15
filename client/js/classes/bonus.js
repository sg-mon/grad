class Bonus
{
	static list  = {};
	static group = null;
	static destroyAll()
	{
		for (let id in Bonus.list)
		{
			Bonus.list[id].destroy();
			delete Bonus.list[id];
		}
	}
	static createBonus(data)
	{
		new Bonus(data.category, data.type, data.position, data.id);
	}
	static destroyBonus(id)
	{
		if (!Bonus.list[id])
			return;

		Bonus.list[id].destroy();
		delete Bonus.list[id];
	}
	static onInitialJoinPopulateBonus(data)
	{
		for(let id in data)
			new Bonus('ammo', data[id].type, data[id].position, id);
	}

	constructor(category, type, position, id)
	{
		this.id       = id;
		this.type     = type;
		this.category = category;
		this.position = position;

		this.gameObj  = this.constructor.group.create(position[0], position[1], type);
		this.gameObj.anchor.x = 0.5;
		this.gameObj.anchor.y = 0.5;

		this.constructor.list[this.id] = this;
	}
	destroy()
	{
		this.gameObj.kill();
	}
}