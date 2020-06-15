class Player
{
	static list    = {};
	static group   = null;
	static destroyAll()
	{
		for (let id in Player.list)
		{
			Player.list[id].gameObj.kill();
			delete Player.list[id];
		}
	}
	static addNewPlayer(id)
	{
		if (!(id in Player.list))
			new Player(id);
	}
	static removePlayer(id)
	{
		Player.list[id].gameObj.kill();
		delete Player.list[id];
	}
	static onInitialJoinPopulatePlayers(data)
	{
		for (let id in data)
			if (!(id in Player.list))
				new Player(id);
	}

	static updateAll(data)
	{
		for (let id in data)
			if (Player.list[id])
				Player.list[id].update(data[id]);
	}
	constructor(id, current)
	{
		if (!id)
			return;

		this.id          = id;
		this.toDelete    = false;
		this.angle       = 0;

		if (current)
			this.isCurrent = current;

		this.gameObj = this.constructor.group.create(260, 260, 'player');
		this.gameObj.anchor.x = 0.5;
		this.gameObj.anchor.y = 0.5;
		this.gameObj.scale.setTo(1);

		this.hp = 100;
		this.kills = 0;

		this.inventory =
		{
			rifle: 0,
			shotgun: 0,
			sniper: 0
		};

		this.activeWeapon = Object.keys(this.inventory)[0];

		this.constructor.list[id] = this;
	}
	update(data)
	{
		this.gameObj.x = data.position[0];
		this.gameObj.y = data.position[1];

		this.kills = data.kills;
		this.inventory = data.inventory;
		this.activeWeapon = data.activeWeapon;
		this.hp = data.hp;


		if (!this.isCurrent)
			this.gameObj.angle = this.gameObj.targetAngle = data.angle;
		else
			rin.game.currentPlayerUpdate(data);

	}
}