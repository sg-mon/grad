export class LineDrawer
{
	static group = null;
	static list = {};
	static updateAll()
	{
		for (let i in this.list)
			this.list[i].update();
	}
	constructor()
	{
		this.graphics = rin.game.ins.make.graphics(0,0);
		LineDrawer.group.add(this.graphics);
		this.graphics.lineStyle(2, 0xffd900, 1);
		this.graphics.endFill();
		this.timeAlive = 0;
		this.id = Math.random();
		LineDrawer.list[this.id] = this;
	}
	update()
	{
		this.timeAlive++;
		if(this.timeAlive > 4)
		{
			this.graphics.clear();
			this.graphics.destroy();
			delete LineDrawer.list[this.id];
		}
	}
}