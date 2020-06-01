export let winManager = 
{
	resizeNeeded: false,
	ticksSinceEvent: 0,
	healthbar: null,
	healthbarbg: null,
	deathmessage: null,
	deathmessagetext: null,
	deathmessagetimer: null,
	statPanel: null,
	healthbarValues:
	{
		hp: null,
		ammo: null,
		kills: null,
		fps: null,
	},
	init()
	{
		window.addEventListener('resize', ()=>
		{
			this.resizeNeeded = true;
			this.ticksSinceEvent = 0;
		});
	},
	resizeUI()
	{
		let w = window.innerWidth * window.devicePixelRatio,
			h = window.innerHeight * window.devicePixelRatio,
			invHeight =  Math.min(64, (w * 0.6)/9),
			invWidth  = invHeight*9 + 5*8;

		for(let i = 1; i <= 9; i++){
			let slot = '#inv' + i;
			$(slot).height(invHeight);
			$(slot).width(invHeight);
			$(slot).css({left: (window.innerWidth - invWidth)/2 + i*84, bottom: invHeight});
		}
		$('.invIcon').height(invHeight-2);
		$('.invIcon').width(invHeight-2);

		//Health bar
		this.healthbar.height(invHeight*0.4);
		this.healthbar.width(invWidth-4);
		this.healthbarbg.height(invHeight*0.4+4);
		this.healthbarbg.width(invWidth);
		this.healthbarbg.css({left: (window.innerWidth - invWidth)/2, bottom: invHeight - invHeight*0.4+4 - 20});
		
		this.resizeDeathMessage();
	},
	resizeDeathMessage()
	{
		let w = window.innerWidth * window.devicePixelRatio,
			h = window.innerHeight * window.devicePixelRatio,
			invHeight =  Math.min(64, (w * 0.6)/9),
			invWidth = invHeight*9 + 5*8,
			textHeight = $('#youdiedtitle').outerHeight(true)
						+ $('#respawntime').outerHeight(true);

		this.deathmessage.height(textHeight);
		this.deathmessage.width(invWidth*0.66);
		this.deathmessage.css({left: window.innerWidth/2});
	},
	createUI()
	{
		this.healthbar   = $("#hp");
		this.healthbarbg = $("#hpbg");

		this.deathmessage      = $("#youdied");
		this.deathmessagetext  = $("#respawntime");
		this.deathmessagetimer = 0;
		//инвентарь

		this.resizeUI();

		//статы
		let sizex = Math.min(64*3),
			sizey = 120,
			x     = 16,
			y     = 16;

		this.statPanel = new SlickUI.Element.Panel(x,y,sizex,sizey);
		rin.slickUI.add(this.statPanel);
		this.statPanel.alpha = 0.8;
		this.healthbarValues.hp    = new SlickUI.Element.Text(16+8,16+4,  'HP: 100', 24);
		this.healthbarValues.ammo  = new SlickUI.Element.Text(16+8,16+32, 'Bullets: 100', 24);
		this.healthbarValues.kills = new SlickUI.Element.Text(16+8,16+60, 'KIlls: 0', 24);
		this.healthbarValues.fps   = new SlickUI.Element.Text(16+8,16+94, 'FPS: 0', 10);

		rin.slickUI.add(this.healthbarValues.hp);
		rin.slickUI.add(this.healthbarValues.ammo);
		rin.slickUI.add(this.healthbarValues.kills);
		rin.slickUI.add(this.healthbarValues.fps);
	},
	updateHealthBar()
	{
		let width = this.healthbarbg.width()-4;
		this.healthbar.width(width*rin.game.currentPlayer.hp/100.0);

		this.healthbarValues.ammo.value  = 'Bullets: ' + rin.game.currentPlayer.inventory[rin.game.currentPlayer.activeWeapon].ammo;
		this.healthbarValues.kills.value = 'Kills: ' + rin.game.currentPlayer.kills;
		this.healthbarValues.hp.value    = 'HP: ' + rin.game.currentPlayer.hp;

		
	},
	updateDeathMessage()
	{
		if(rin.game.currentPlayer.hp <= 0)
		{
			if(this.deathmessagetimer <= 0)
			{
				this.deathmessagetimer = 600;
				this.deathmessage.css('display', 'block');	
			}
			this.resizeDeathMessage();
			this.deathmessagetimer--;
			let respawnTime = Math.ceil(this.deathmessagetimer / 60);
			this.deathmessagetext.text("Перерождение через " + respawnTime + " сек.");
		}
		else
		{
			this.deathmessagetimer = 0;
			this.deathmessage.css('display', 'none');
		}
	},
	resizeGameWindow()
	{
		let w = window.innerWidth * window.devicePixelRatio,
			h = window.innerHeight * window.devicePixelRatio;
		rin.game.ins.scale.setGameSize(w, h);
		rin.layer.resize(w,h);
		rin.game.ins.camera.follow(rin.game.currentPlayer.gameObj, Phaser.Camera.FOLLOW_TOPDOWN, 0.1, 0.1);
		this.resizeUI();
		// layer.resizeWorld();
		console.log("resize " + window.innerHeight * window.devicePixelRatio);
	},
	update()
	{
		if(!rin.game.currentPlayer)
			return;
		this.updateHealthBar();
		this.updateDeathMessage();
		if(!this.resizeNeeded)
			return;
		this.ticksSinceEvent++;
		if(this.ticksSinceEvent < 5)
			return;

		this.ticksSinceEvent = 0
		this.resizeNeeded = false;
		this.resizeGameWindow();
	},
};