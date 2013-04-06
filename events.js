
var name;
var delta = 20;
var me = new Player();
var ball = new Ball();
var red = new Array();
var blue = new Array();

var field;
var ctx;

var upPressed = false;
var downPressed = false;
var rightPressed = false;
var leftPressed = false;

$(document).ready(function() {
	$("#loginForm").submit(login);
	var up = 38;
	var down = 40;
	var left = 37;
	var right = 39;
	$(window).keydown(function(e) {
       var key = e.which;
	   if (key == up) {
		   upPressed = true;
	   } else if (key == down) {
		   downPressed = true;
	   } else if (key == right) {
		   rightPressed = true;
	   } else if (key == left) {
		   leftPressed = true;
	   }
   });
	$(window).keyup(function(e) {
       var key = e.which;
	   if (key == up) {
		   upPressed = false;
	   } else if (key == down) {
		   downPressed = false;
	   } else if (key == right) {
		   rightPressed = false;
	   } else if (key == left) {
		   leftPressed = false;
	   }
   });
});

function playGame() {
	while (true) {
		// get data
		// var json = getDrawData();
		console.log("start");
		var json = {
			ball:{x:3,y:4},
				red:[{id:"one",x:5,y:5,dir:90,action:"run"},{id:"two",x:12,y:2,dir:270,action:"run"}],
				blue:[{id:"two",x:6,y:6,dir:180,action:"run"}]
		};
		console.log("updating ball");
		ball.x = json.ball.x;
		ball.y = json.ball.y;
		console.log("updated");
		$.each(json.red, function(i, item) {
			var found = null;
			$.each(red, function(j, p) {
				console.log(p);
				if (item.id == p.name) {
					found = p;
					return;
				}
			});
			if (found != null) {
				found.x = item.x;
				found.y = item.y;
			} else {
				var newPlayer = new Player();
				newPlayer.name = item.id;
				newPlayer.x = item.x;
				newPlayer.y = item.y;
				red.push(newPlayer);
			}
		});
		$.each(json.blue, function(i, item) {
			var found = null;
			$.each(blue, function(j, p) {
				if (item.id == p.name) {
					found = p;
					return;
				}
			});
			if (found != null) {
				found.x = item.x;
				found.y = item.y;
			} else {
				var newPlayer = new Player();
				newPlayer.name = item.id;
				newPlayer.x = item.x;
				newPlayer.y = item.y;
				blue.push(newPlayer);
			}
		});
		// update all positions
		// draw to screen
		return;
	}
}

/*
while(true){
	//fetch
	$json = getDrawData();
	//draw
	ctx.drawImage("ball.png",$json.ball.x, $json.ball.y);
	$.each($json.red,function(index,value){
		ctx.drawImage("red_" + value.action + ".png", value.x, value.y);
		ctx.fillText(value.id,x,y);
	});
	$.each($json.blue,function(index,value){
		ctx.drawImage("blue_" + value.action + ".png", value.x, value.y);
		ctx.fillText(value.id,x,y);
	});
}
*/

function canvasDraw(){
	field = document.getElementById("field");
	ctx = field.getContext('2d');
	var fieldImage = new Image();
	fieldImage.src = "field.png";
	fieldImage.onload = function(){
		$('canvas').attr('width', '1000').attr('height', '600');
		ctx.drawImage(fieldImage, 0, 0, 1000, 600);
	}
}

function login(e){
	e.stopPropagation();
	e.preventDefault();
	var theName = $('#loginForm').serializeArray();
	console.log(theName[0].value);
	if (theName[0].value == ""){
		alert("Please Type a Name, GO!");
	}
	else{
		name = theName.value;
		addUser(name);
		$("#login").slideUp();
		$("#login").fadeOut(200);
		$("#header").delay(200).fadeIn(200);
		$("#field").animate({opacity: '100%'}, 200, 'swing', function() {
    		$("#field").css('display', 'block');
		});
		canvasDraw();
	}
	playGame();
	
}


function Player() {
	var name;
	var x;
	var y;
	var action;
	var dir;
}

function Ball() {
	var x;
	var y;
	var dir;
}
