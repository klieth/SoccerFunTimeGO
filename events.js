
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
	console.log('images set up');
	
	while (true) {
		// get data
		// var json = getDrawData();
		var json = {
			ball:{x:3,y:4},
				red:[{id:"one",x:5,y:5,dir:90,action:"run"},{id:"two",x:12,y:2,dir:270,action:"run"}],
				blue:[{id:"two",x:6,y:6,dir:180,action:"run"}]
		};
		ball.x = json.ball.x;
		ball.y = json.ball.y;
		$.each(json.red, function(i, item) {
			var found = null;
			$.each(red, function(j, p) {
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
		
		$.each(json.red,function(index,value){
			if (value.action == "run")
				ctx.drawImage(redRunningImage, value.x, value.y);
			else if (value.action == "stand")
				ctx.drawImage(redStandingImage, value.x, value.y);
			else if (value.action == "kick")
				ctx.drawImage(redkickingImage, value.x, value.y);
			ctx.fillText(value.id,value.x,value.y-10);
		});
		$.each(json.blue,function(index,value){
			if (value.action == "run")
				ctx.drawImage(blueRunningImage, value.x, value.y);
			else if (value.action == "stand")
				ctx.drawImage(blueStandingImage, value.x, value.y);
			else if (value.action == "kick")
				ctx.drawImage(bluekickingImage, value.x, value.y);
			ctx.fillText(value.id,value.x,value.y-10);
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
	console.log('canvas draw started');
	field = document.getElementById("field");
	ctx = field.getContext('2d');
	console.log('canvas set up');
	var fieldImage = new Image();
	fieldImage.src = "field.png";
	console.log('image set up');
	$('canvas').attr('width', '1000').attr('height', '600');
	fieldImage.onload = function(){
		ctx.drawImage(fieldImage, 0, 0, 1000, 600);
	}
}

function login(e){
	e.stopPropagation();
	e.preventDefault();
	var theName = $('#loginForm').serializeArray();
	if (theName[0].value == ""){
		alert("Please Type a Name, GO!");
	}
	else{
		name = theName[0].value;
		addUser(name);
		$("#login").slideUp();
		$("#login").fadeOut(200);
		$("#header").delay(200).fadeIn(200);
		$("#field").animate({opacity: '100%'}, 200, 'swing', function() {
    		$("#field").css('display', 'block');
		});
		canvasDraw();
	}
	preload();
	
}

var images = new Object();

function preload() {
	loader = new PxLoader();
	var imagenames = [
		"ball",
		"red_running",
		"blue_running",
		"red_standing",
		"blue_standing",
		"red_kicking",
		"blue_kicking"
	];
	$.each(imagenames, function(i, imgName) {
		var pxImg = new PxLoaderImage(imgName + ".png");
		pxImg.name = imgName;
		loader.add(pxImg);
	});
	loader.addProgressListener(function(e) {
		console.log("name: " + e.resource.name);
		images[e.resource.name] = e.resource;
		console.log("Loaded image number " + e.completedCount);
	});
	loader.start();
	loader.addCompletionListener(function(e) {
		playGame();
	});
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
