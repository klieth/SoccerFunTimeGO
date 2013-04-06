var name;
var field;
var ctx;
$(document).ready(function() {
	canvasDraw();
});
function canvasDraw(){
	field = Document.getElementById('field');
	ctx = field.getContext('2d');
	field.drawImage("field.png",0,0);
}
function login(e){
	e.stopPropogation();
	e.preventDefault();
	$("#login").slideUp();
	var theName = $('#login').serialize();
	name = theName.name;
	submitCharacter();
}
function submitCharacter(){
	submit(name);
}

while(true){
	//fetch
	$json = getDrawData();
	//draw
	ctx.drawImage("ball.png",$json.ball.x, $json.ball.y);
	$.each($json.red,function(index,value){
		ctx.drawImage("red_" + value.action + ".png", value.x, value.ball.y);
		ctx.fillText(value.id,x,y)
	});
	$.each($json.blue,function(index,value){
		ctx.drawImage("blue_" + value.action + ".png", value.x, value.ball.y);
	});
}