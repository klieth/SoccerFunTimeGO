
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

$(document).ready(function() {
	login();
});

function animate() {
	ctx.drawImage(images.field, 0, 0, 1000, 600);
	var estamt = delta/(moveInterval/animateRate);
	$.each(red,function(index,value){
		console.log(value.dir);
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
		//console.log(value.dir);
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
		if (value.action == "run") {
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
}

function canvasDraw(){
	console.log('canvas draw started');
	field = document.getElementById("field");
	ctx = field.getContext('2d');
	console.log('canvas set up');
	$('canvas').attr('width', '1000').attr('height', '600');
}

function login(){
		$("#login").slideUp();
		$("#login").fadeOut(200);
		$("#header").delay(200).fadeIn(200);
		$("#field").animate({opacity: '100%'}, 200, 'swing', function() {
    		$("#field").css('display', 'block');
		});
		canvasDraw();
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
		setInterval(animate,animateRate);
		setInterval(getDrawData,moveInterval);
		//setInterval(getDrawData,200);
	});
}


