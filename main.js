var keymap = {};
keymap[38] = 0;
keymap[33] = 1;
keymap[39] = 2;
keymap[34] = 3;
keymap[40] = 4;
keymap[35] = 5;
keymap[37] = 6;
keymap[36] = 7;

var Player = function(x, y){
	this.x = x;
	this.y = y;
};

Player.prototype.draw = function(){
	Game.display.draw(this.x, this.y, "@", "#f00");
};

Player.prototype.act = function(){
	Game.engine.lock();
	window.addEventListener("keydown", this);
};

Player.prototype.handleEvent = function(e){
	var c = e.keyCode;

	if(c === 13 || c === 32){
		this.openBox();
		return;
	}

	if(!(c in keymap)){
		return;
	}

	var diff = ROT.DIRS[8][keymap[c]];
	var x1 = this.x + diff[0];
	var y1 = this.y + diff[1];
	var nk = x1 + "," + y1;
	if(!(nk in Game.map)){
		return;
	}

	// Draw what was beneath the player:
	Game.drawPartMap(this.x+","+this.y);
	this.x = x1;
	this.y = y1;
	this.draw();
	window.removeEventListener("keydown", this);
	Game.engine.unlock();
};

Player.prototype.openBox = function(){
	var key = this.x + "," + this.y;
	if(Game.map[key] != "*"){
		return;
	}
	if(key === Game.prize){
		alert("you did it, hooray.");
		return;
	}
	alert("you didn't do it, boo.");
};

var Opponent = function(x, y){
	this.x = x;
	this.y = y;
};

Opponent.prototype.draw = function(){
	Game.display.draw(this.x, this.y, "☹", "#911");
};

Opponent.prototype.act = function(){
	var passable = function(x, y){
		return x+","+y in Game.map;
	};
	var astar = new ROT.Path.AStar(Game.player.x, Game.player.y, passable, {topology:4});
	if(!astar){
		alert("help");
	}
	var path = [];
	var addpath = function(x, y){
		path.push([x, y]);
	};
	astar.compute(this.x, this.y, addpath);

	path.shift();
	if(path.length === 1){
		Game.engine.lock();
		alert("LOSER");
	}else{
		Game.drawPartMap(this.x+","+this.y);
		this.x = path[0][0];
		this.y = path[0][1];
		this.draw();
	}
};

var Game = {
	engine: null,
	display: null,
	player: null,
	prize: null,
	map: {},
	colors: {
		'.': '#fff',
		'*': '#ff0',
	},

	init: function(){
		this.display = new ROT.Display();
		document.body.appendChild(this.display.getContainer());
		this.generateMap();
		var sched = new ROT.Scheduler.Simple();
		sched.add(this.player, true);
		sched.add(this.enemy, true);
		this.engine = new ROT.Engine(sched);
		this.engine.start();
	},

	generateMap: function(){
		var digger = new ROT.Map.Digger();
		var cells = [];
		var store = function(x, y, value){
			if(value){
				// it's a wall
				return;
			}
			var key = x + "," + y;
			cells.push(key)
			this.map[key] = ".";
		};
		digger.create(store.bind(this));
		cells = cells.randomize();
		this.generateBoxes(cells.slice(0,10));
		this.player = this.createBeing(Player, cells.slice(10,11));
		this.enemy = this.createBeing(Opponent, cells.slice(11,12));
		this.drawWholeMap();
		this.player.draw();
		this.enemy.draw();
	},

	generateBoxes: function(cells){
		this.prize = cells[0];
		for(var i = 0; i < 10; i++){
			this.map[cells[i]] = "*";
		}
	},

	generatePlayer: function(cells){
		var parts = cells[0].split(",");
		var x = parseInt(parts[0]);
		var y = parseInt(parts[1]);
		this.player = new Player(x, y);
	},

	drawWholeMap: function(){
		for(var key in this.map){
			this.drawPartMap(key);
		}
	},

	drawPartMap: function(key){
		var parts = key.split(",");
		var x = parseInt(parts[0]);
		var y = parseInt(parts[1]);
		this.display.draw(x, y, this.map[key], this.colors[this.map[key]]);
	},

	createBeing: function(what, cells){
		var parts = cells[0].split(",");
		var x = parseInt(parts[0]);
		var y = parseInt(parts[1]);
		return new what(x, y);
	},
};

