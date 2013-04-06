
var name;
var delta = 20;
var me = new Player();
var players = new Array();

var field;
var ctx;

var upPressed = false;
var downPressed = false;
var rightPressed = false;
var leftPressed = false;

$(document).ready(function() {
	$("#loginbtn").click(function(e){
		login(e)
	});
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
		var json = getDrawData();
		$.each(json, function(i, item) {
			console.log(item);
		});
		// update all positions
		// draw to screen
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
	ctx.drawImage(fieldImage, 0, 0, 340, 220);

}

function login(e){
	e.stopPropagation();
	e.preventDefault();
	var theName = $('#loginForm').serializeArray();
	console.log(theName[0].value);
	if (theName[0].value == ""){
		alert("Please Type a Name, Douche.");
	}
	else{
		name = theName.value;
		addUser(name);
		$("#login").slideUp();
		$("#login").fadeOut(200);
		$("#header").delay(200).fadeIn(200);
		$("#field").animate({opacity: '100%'}, 200, 'swing', function() {
    		$("#field").css('display', 'block'); // or you could use this.css('display', '')
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
