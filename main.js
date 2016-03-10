var Game = {
	display: null,
	map: {},
	colors: {
		'.': '#fff',
		'*': '#ff0',
	},

	init: function(){
		this.display = new ROT.Display();
		document.body.appendChild(this.display.getContainer());
		//this.display.draw(5,  4, "@");
		this.generateMap();
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
		this.generateBoxes(cells);
		this.drawWholeMap();
	},

	generateBoxes: function(cells){
		cells = cells.randomize();
		for(var i = 0; i < 10; i++){
			console.log(cells[i]);
			this.map[cells[i]] = "*";
		}
	},

	drawWholeMap: function(){
		for(var key in this.map){
			var parts = key.split(",");
			var x = parseInt(parts[0]);
			var y = parseInt(parts[1]);
			this.display.draw(x, y, this.map[key], this.colors[this.map[key]]);
		}
	},
};
