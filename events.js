
var name;
var delta = 12;
var animateRate = 50;
var moveInterval = 200;
var ballRate = 4;
var me = new Player();

var field;
var ctx;

var upPressed = false;
var downPressed = false;
var rightPressed = false;
var leftPressed = false;
var spacePressed = false;

$(document).ready(function() {
	$("#loginForm").submit(login);
	var up = 38;
	var down = 40;
	var left = 37;
	var right = 39;
	var space = 32;
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
	   } else if (key == space) {
		   spacePressed = true;
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
	   } else if (key == space) {
		   spacePressed = false;
	   }
   });
});

function animate() {
	ctx.drawImage(images.field, 0, 0, 1000, 600);
	var estamt = delta/(moveInterval/animateRate);
	$.each(red,function(index,value){
		if (value.dir != -1){
			if (value.dir == 2 || value.dir == 1 || value.dir == 3) {
				value.x += estamt;
			} 
			if (value.dir == 3 || value.dir == 4 || value.dir == 5){
				value.y += estamt;
			}
			if (value.dir == 5 || value.dir == 6 || value.dir == 7){
				value.x -= estamt;
			}
			if (value.dir == 7 || value.dir == 0 || value.dir == 1){
				value.y -= estamt;
			}
		}

		if (value.fireball) {
			ctx.drawImage(images.kaboom, value.x, value.y);
		} else if (value.action == "run") {
			ctx.drawImage(images.red_running, value.x, value.y);
		} else if (value.action == "stand") {
			ctx.drawImage(images.red_standing, value.x, value.y);
		} else if (value.action == "kick") {
			ctx.drawImage(images.red_kicking, value.x, value.y);
		}
		ctx.fillText(value.name,value.x,value.y-10);
	});
	$.each(blue,function(index,value){
		if (value.dir != -1){
			if (value.dir == 2 || value.dir == 1 || value.dir == 3) {
				value.x += estamt;
			} 
			if (value.dir == 3 || value.dir == 4 || value.dir == 5){
				value.y += estamt;
			}
			if (value.dir == 5 || value.dir == 6 || value.dir == 7){
				value.x -= estamt;
			}
			if (value.dir == 7 || value.dir == 0 || value.dir == 1){
				value.y -= estamt;
			}
		}
		if (value.fireball) {
			ctx.drawImage(images.kaboom,value.x,value.y);
		} else if (value.action == "run") {
			ctx.drawImage(images.blue_running, value.x, value.y);
		} else if (value.action == "stand") {
			ctx.drawImage(images.blue_standing, value.x, value.y);
		} else if (value.action == "kick") {
			ctx.drawImage(images.blue_kicking, value.x, value.y);
		}
		ctx.fillText(value.name,value.x,value.y-10);
	});
	//ball.x += ball.dx * (animateRate/ballRate);
	//ball.y += ball.dy * (animateRate/ballRate);
	ball.x += ball.dx / ballRate;
	ball.y += ball.dy / ballRate;
	ctx.drawImage(images.ball, ball.x, ball.y);
	ctx.fillText("SCORE: "   + redScore + "---" + blueScore, 400, 50);
}

function move() {
	if (downPressed || upPressed || rightPressed || leftPressed){
		me.action = "run";
		sendAction(me.action);
	} else {
		me.action = "stand";
		sendAction(me.action);
	}
	if (spacePressed) {
		sendKick();
	}
	this.dir = -1;
	if (downPressed) {
		if(me.y < 570){
			me.y = me.y + delta;
			me.dir = 4;
			if (leftPressed){
				me.x = me.x - delta;
				me.dir++;
			}
			else if (rightPressed){
				me.x = me.x + delta;
				me.dir--;
			}
		}
	}
	else if (upPressed) {
		if(me.y > 0){
			me.y = me.y - delta;
			me.dir = 0;
			if (rightPressed){
				me.x = me.x + delta;
				me.dir++;
			}
			else if (leftPressed){
				me.x = me.x - delta;
				me.dir = 7;
			}
		}	
	}
	else if (leftPressed && this.dir == -1) {
		if(me.x > 0){
			me.x = me.x - delta;
			me.dir = 6;
		}	
	}
	else if (rightPressed && this.dir == -1) {
		if(me.x < 980){
			me.x = me.x + delta;
			me.dir = 2;
		}	
	} else {
		me.dir = -1;
	}
	me.updatePosition();
}

function canvasDraw(){
	field = document.getElementById("field");
	ctx = field.getContext('2d');
	$('canvas').attr('width', '1000').attr('height', '600');
	ctx.font="15pt Arial";
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
		addUser(name.replace(" ","_").substr(0,6));
		$("#header_logo").slideUp();
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
		"field",
		"ball",
		"red_running",
		"blue_running",
		"red_standing",
		"blue_standing",
		"red_kicking",
		"blue_kicking",
		"kaboom"
	];
	$.each(imagenames, function(i, imgName) {
		var pxImg = new PxLoaderImage(imgName + ".png");
		pxImg.name = imgName;
		loader.add(pxImg);
	});
	loader.addProgressListener(function(e) {
		images[e.resource.name] = e.resource.img;
	});
	loader.start();
	loader.addCompletionListener(function(e) {
		setInterval(animate,animateRate);
		setInterval(move,moveInterval);
	});
}


