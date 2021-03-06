
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
function sendPosition(newX, newY, newDir) {
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
		me.action = data.Action;
		getDrawData();
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

function sendKick() {
	$.ajax({
		url:gameurl,
		data: {
			cmd:"kick"
		},
		type:'POST'
	}).done(function(data) {
		var json = eval( '(' + data + ')' );
		$.each(red, function(i, p) {
			if (p.name == json.Name) {
				p.action = "kick";
				return;
			}
		});
		$.each(blue, function(i, p) {
			if (p.name == json.Name) {
				p.action = "kick";
				return;
			}
		});
		json.Name;
	});
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
		ball.x = json.ball.X;
		ball.y = json.ball.Y;
		ball.dx = json.ball.VelocityX;
		ball.dy = json.ball.VelocityY;
		$.each(json.players, function(i, p) {
			var player = new Player();
			player.name = p.Name;
			player.x = p.X;
			player.y = p.Y;
			player.action = p.Action;
			player.dir = p.Direction;
			player.fireball = p.Fireball;
			//console.log(player.dir);
			if (p.OnTeamA == false) {
				red.push(player);
			} else {
				blue.push(player);
			}
		});
		redScore = json.score.TeamBScore;
		blueScore = json.score.TeamAScore;
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
	this.fireball;
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
	this.x = 500;
	this.y = 300;
	this.dx;
	this.dy;
}


var redScore = 0;
var blueScore = 0;

var ball = new Ball();
var red = new Array();
var blue = new Array();


