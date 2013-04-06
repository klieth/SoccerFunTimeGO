var name;
var field;
var ctx;
$(document).ready(function() {
	canvasDraw();
});
function canvasDraw(){
	field = document.getElementById("field");
	ctx = field.getContext('2d');
	var fieldImage = new Image();
	fieldImage.src = "field.png";
	ctx.drawImage(fieldImage, 0, 0);
}
function login(e){
	e.stopPropagation();
	e.preventDefault();
	var theName = $('#login').serializeJSON();
	console.log(theName);
	if (theName.name == "")
		alert("Please Type a Name, Douche.");
	else{
		name = theName.name;
		submitCharacter();
		$("#login").slideUp();
	}
}
function submitCharacter(){
	submit(name);
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