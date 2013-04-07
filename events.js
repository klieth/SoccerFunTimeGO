
var name;
var delta = 20;
var me = new Player();

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

function animate() {
	
	ctx.drawImage(images.field, 0, 0, 1000, 600);
	var frameamt = 10;
	$.each(red,function(index,value){
		console.log(value.dir);
		if (value.dir == 0) {
			value.y += frameamt;
		} else if (value.dir == 1) {
			value.y -= frameamt;
		} else if (value.dir == 2) {
			value.x -= frameamt;
		} else if (value.dir == 3) {
			value.x += frameamt;
		}
		if (value.action == "run") {
			ctx.drawImage(images.red_running, value.x, value.y);
		} else if (value.action == "stand") {
			ctx.drawImage(images.red_standing, value.x, value.y);
		} else if (value.action == "kick") {
			ctx.drawImage(images.red_kicking, value.x, value.y);
		}
		ctx.fillText(value.name,value.x,value.y-10);
	});
	$.each(blue,function(index,value){
		console.log(value.dir);
		if (value.dir == 0) {
			value.y += frameamt;
		} else if (value.dir == 1) {
			value.y -= frameamt;
		} else if (value.dir == 2) {
			value.x -= frameamt;
		} else if (value.dir == 3) {
			value.x += frameamt;
		}
		if (value.action == "run") {
			ctx.drawImage(images.blue_running, value.x, value.y);
		} else if (value.action == "stand") {
			ctx.drawImage(images.blue_standing, value.x, value.y);
		} else if (value.action == "kick") {
			ctx.drawImage(images.blue_kicking, value.x, value.y);
		}
		ctx.fillText(value.name,value.x,value.y-10);
	});
	ball.x += ball.dx;
	ball.y += ball.dy;
	ctx.drawImage(images.ball, ball.x, ball.y);
}

function move() {
	if (downPressed || upPressed || rightPressed || leftPressed){
		me.action = "run";
		sendAction(me.action);
	} else {
		me.action = "stand";
		sendAction(me.action);
	}
	if (downPressed) {
		if(me.y < 570){
			//console.log("down pressed");
			me.y = me.y + 3;
			me.dir = 0;
			//console.log(me.y);
		}
	}
	if (upPressed) {
		if(me.y > 0){
			//console.log("up pressed");
			me.y = me.y - 3;
			me.dir = 1;
			//console.log(me.y);
		}	
	}
	if (leftPressed) {
		if(me.x > 0){
			//console.log("right pressed");
			me.x = me.x - 3;
			me.dir = 3;
			//console.log(me.x);
		}	
	}
	if (rightPressed) {
		if(me.x < 980){
			//console.log("left pressed");
			me.x = me.x + 3;
			me.dir = 2;
			//console.log(me.x);
		}	
	}
	me.updatePosition();
}

function canvasDraw(){
	console.log('canvas draw started');
	field = document.getElementById("field");
	ctx = field.getContext('2d');
	console.log('canvas set up');
	$('canvas').attr('width', '1000').attr('height', '600');
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
		"field",
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
		//console.log(e.resource.img);
		images[e.resource.name] = e.resource.img;
		console.log("Loaded image number " + e.completedCount);
	});
	loader.start();
	loader.addCompletionListener(function(e) {
		setInterval(animate,100);
		setInterval(move,200);
		setInterval(getDrawData,300);
	});
}


