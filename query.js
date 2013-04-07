
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
	}).done(function() {
		console.log("User added");
	});
}

//
// Sends the x and the y position to the url
//
function sendPosition(newX, newY) {
	$.ajax({
		url:gameurl,
		data:{
			cmd:"pos",
			x: newX,
			y: newY
		},
		type:'POST',
		statusCode: {
			503: function() {
				console.log("Server is currently down.");
			}
		}
	}).done(function() {});
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
	return getWrapper("all");
}

//
// Gets the count of each team
// returns {red:3,blue:4} (JSON created in string on server)
//
function getTeamCounts() {
	getWrapper("teamsize");
}




function Player() {
	var name;
	var x;
	var y;
	var action = "stand";
	var dir;
	this.updatePosition = function() {
		sendPosition(this.x,this.y);
	}
	this.updateAction = function(act) {
		this.action = act;
		sendPlayerActionUpdate(this.action);
	}
}

function Ball() {
	var x;
	var y;
	var dir;
}



var ball = new Ball();
var red = new Array();
var blue = new Array();



function getWrapper(command) {
	$.ajax({
		url:"http://soccerfuntimego.mattcorallo.com/game",
		data:{
			cmd:command
		},
		type:'GET',
		statusCode: {
			503: function() {
				console.log("Server is currently down.");
			}
		}
	}).done(function(data) {
		console.log(data);
		var json = eval(data);
		red = new Array();
		blue = new Array();
		ball.x = json.ball.x;
		ball.y = json.ball.y;
		$.each(json.players, function(i, p) {
			var player = new Player();
			player.name = p.Name;
			player.x = p.X;
			player.y = p.Y;
			if (p.OnTeamA == true) {
				red.push(player);
			} else {
				blue.push(player);
			}
		});
	});
}
