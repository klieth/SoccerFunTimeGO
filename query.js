
/**
 * LIST OF SERVER COMMANDS:
 *
 * POST
 * adduser -- adds user with id (default position, team, etc set on server)
 * pos -- sets the position (id sent as cookie)
 * action -- set the current action
 *
 * GET
 * all -- returns all data
 * teamsize -- returns the size of each team
 */

/**
 * player has:
 * 		id
 * 		x, y
 * 		direction
 * 		action
 */

/**
 * Nort 1
 * south 0
 * west 2
 * east 3
 */

var gameurl = "http://soccerfuntimego.mattcorallo.com/game";

//
//
//
function addUser(id) {
	$.ajax({
		url:gameurl,
		data: {
			cmd: "adduser",
			name: id
		},
		type: 'POST',
		statusCode: {
			503: function() {
				console.log("Server is currently down.");
			}
		}
	}).done(function(data) {
		//console.log(data);
		data = eval("(" + data + ")");
		me.x = data.X;
		me.y = data.Y;
		me.name = data.Name;
		me.dir = data.Direction;
		console.log("User added");

	});
}

//
// Sends the x and the y position to the url
//
function sendPosition(newX, newY, newDir, action) {
	$.ajax({
		url:gameurl,
		data:{
			cmd:"pos",
			x: newX,
			y: newY,
			dir: newDir
		},
		type:'POST',
		statusCode: {
			503: function() {
				console.log("Server is currently down.");
			}
		}
	}).done(function(data) {
		//console.log(data);
		data = eval("(" + data + ")");
		me.x = data.X;
		me.y = data.Y;
		me.action = data.action;
	});
}

//
//
//
function sendAction(act) {
	$.ajax({
		url:gameurl,
		data: {
			cmd:"action",
			action: act
		},
		type:'POST'
	}).done(function() {});
}


//
// Gets a current snapshot of the game
// returns
// 	{
// 		ball: {x: 123, y: 234},
// 		red: [{id:asdf,x:2,y:3,action:run},{...},{...}],
// 		blue: [{id:asdf,x:2,y:3,action:run},{...}]
// 	}
//
function getDrawData() {
	$.ajax({
		url:gameurl,
		data:{
			cmd:"all"
		},
		type:'GET',
		statusCode: {
			503: function() {
				console.log("Server is currently down.");
			}
		}
	}).done(function(data) {
		//console.log(data);
		var json = eval( '(' + data + ')');
		red = new Array();
		blue = new Array();
		ball.x = json.ball.x;
		ball.y = json.ball.y;
		$.each(json.players, function(i, p) {
			var player = new Player();
			player.name = p.Name;
			player.x = p.X;
			player.y = p.Y;
			if (p.OnTeamA == false) {
				red.push(player);
			} else {
				blue.push(player);
			}
		});
	});
}

//
// Gets the count of each team
// returns {red:3,blue:4} (JSON created in string on server)
//
function getTeamCounts() {
	$.ajax({
		url:gameurl,
		data:{
			cmd:"teamsize"

		},
		type:'GET'
	}).done(function(data) {
	});
}




function Player() {
	this.name;
	this.x;
	this.y;
	this.action = "stand";
	this.dir;
	this.updatePosition = function() {
		//sendPosition(this.x,this.y);
		sendPosition(this.x, this.y, this.dir);
	}
	this.updateAction = function(act) {
		this.action = act;
		sendPlayerActionUpdate(this.action);
	}
}

function Ball() {
	var x = 500;
	var y = 300;
	this.dir;
}



var ball = new Ball();
var red = new Array();
var blue = new Array();



function getWrapper(command) {
}
