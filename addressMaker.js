const message = '' // Try edit me
const global = {increments:16, spokes:16, showAddress: false, graphType: "radial" };

window.addEventListener('load', main);
window.addEventListener('keydown', keyDown, false);

outerPoints=[];
outerXs=[];
outerYs=[];
innerPoints=[];
innerXs=[];
innerYs=[];

function main(){
	//get canvas context to draw upon.
	global.canvas = document.getElementById('canvas');
	global.room_width=canvas.width;
	global.room_height=canvas.height;
    global.ctx = global.canvas.getContext('2d');
	
	buildArrays(global.spokes);
	plotArrays(global.graphType);
}

function keyDown(evt) {
	console.log("Keydown event: "+evt.key);
	if(evt.key == "l") {global.graphType="linear";}
	if(evt.key == "r") {global.graphType="radial";}
	if(evt.key == "a") {global.showAddress = ! global.showAddress;}
	if(evt.key == " ") {buildArrays(global.spokes);}
	if(evt.key == "s") {global.spokes--; buildArrays(global.spokes);}
	if(evt.key == "S") {global.spokes++; buildArrays(global.spokes);}
	if(evt.key == "i") {global.increments--; buildArrays(global.spokes);}
	if(evt.key == "I") {global.increments++; buildArrays(global.spokes);}

	
	return plotArrays(global.graphType);
}

function plotArrays(type){
	//clear the canvas	
	global.ctx.clearRect(0,0,global.room_width, global.room_height);
	//draw the plot
	if(type=="radial") { plotArraysRadial(); }
	if(type=="linear") { plotArraysLinear(); }
	printAddress();
}

function printAddress(){
	console.log("printing address");
	global.ctx.font = "20px Arial";
	global.ctx.fillStyle = "black";
	global.ctx.textAlign = "center";
	var outerAddr="Outer: "+outerPoints.join(",");	
	var innerAddr="Inner: "+innerPoints.join(",");
	document.getElementById("AdressText").innerHTML=outerAddr+"<br>"+innerAddr+"<br> Spokes: "+global.spokes+"<br>Increments: "+global.increments;
	if(global.showAddress) {
		global.ctx.fillText(outerAddr, global.room_width/2, global.room_height-25);
		global.ctx.fillText(innerAddr, global.room_width/2, global.room_height-2);
	}
}

function plotArraysRadial(){
	console.log("Plotting radial address");
	ind=0;  //index for arrays from 0 to spokes.
	
	for (var i=0; i<360 ;i+=(360/global.spokes)) { // 16 steps around the circle 22.5 degrees
		var outer = outerPoints[ind];
		var inner = innerPoints[ind];
		console.log("plotting: " + outer + " and " + inner);
		var x_scale=(global.room_width/2)/global.increments;
		var y_scale=(global.room_height/2)/global.increments;
		outerX=(global.room_width/2)+(Math.sin(i*0.0174533)*(outer*x_scale));
		outerY=(global.room_height/2)+(Math.cos(i*0.0174533)*(outer*y_scale));
		outerXs[ind]=outerX;
		outerYs[ind]=outerY;
		//circle( outerX, outerY, "green");
		
		innerX=(global.room_width/2)+(Math.sin(i*0.0174533)*(inner*x_scale));
		innerY=(global.room_height/2)+(Math.cos(i*0.0174533)*(inner*y_scale));
		//circle(innerX , innerY, "red");
		innerXs[ind]=innerX;
		innerYs[ind]=innerY;
		
		ind++;
	}
	
	traceAndFill(outerXs, outerYs, 'red', 'black');
	traceAndFill(innerXs, innerYs, 'white', 'black');
	
}

function plotArraysLinear(){
	console.log("Plotting linear address");
	var ind=0;  //index for arrays from 0 to spokes.
	var linear_x_scale=global.room_width/global.spokes;
	var y_scale=(global.room_height/2)/global.increments;

	while(ind < outerPoints.length) {
		outerXs[ind] = (ind * linear_x_scale)+linear_x_scale/2;
		outerYs[ind] = (global.room_height/2)-((y_scale*global.increments)/2)+(outerPoints[ind]*y_scale);
		//circle(outerXs[ind],outerYs[ind],'black');
		
		innerXs[ind] = (ind * linear_x_scale)+linear_x_scale/2;
		innerYs[ind] = (global.room_height/2)-((y_scale*global.increments)/2)+(innerPoints[ind]*y_scale);
		//console.log("Inner coords: "+ innerXs[ind] +","+innerYs[ind]);
		//circle(innerXs[ind],innerYs[ind],'yellow');
		ind++;
	}
	
	revOuterXs=outerXs;
	revOuterYs=outerYs;
	revOuterXs.reverse();
	revOuterYs.reverse();
	
	traceAndFill(innerXs.concat(revOuterXs), innerYs.concat(revOuterYs), 'red', 'black');
	//traceAndFill(innerXs, innerYs, 'red', 'black');
	
}

function traceAndFill(Xs, Ys, fillColor, lineColor){
    global.ctx.fillStyle = fillColor;
    global.ctx.beginPath();     //Begin a path..
    global.ctx.moveTo(Xs[0], Ys[0]);  //Startpoint (x1, y1)
	var i=1;
	while( i < Xs.length ) {
		global.ctx.lineTo(Xs[i], Ys[i]); //Point i    (x, y)
		i++;
	}
    global.ctx.closePath();     //Close the path.
    //Fill triangle with previous set color.
    global.ctx.fill();
    //Give triangle a stroke (width: 4 pixels).
    global.ctx.strokeStyle = lineColor;
    global.ctx.lineWidth   = 1;
    global.ctx.stroke();
}

function circle (x, y, color){
	global.ctx.beginPath();
	global.ctx.arc(x, y, 6, 0, 2 * Math.PI);
	global.ctx.strokeStyle = color;
	global.ctx.stroke();	
}

function line(x1,y1,x2,y2) {
	global.ctx.beginPath(); // Start a new path
	global.ctx.moveTo(x1,y1); // Move the pen to (30, 50)
	global.ctx.lineTo(x2, y2); // Draw a line to (150, 100)
	global.ctx.stroke(); // Render the path
	
}

function triangle(x1,y1,x2,y2,x3,y3,color){
    global.ctx.fillStyle = color;
    global.ctx.beginPath();     //Begin a path..
    global.ctx.moveTo(x1, y1);  //Startpoint (x1, y1)
    global.ctx.lineTo(x2, y2); //Point 1    (x, y)
    global.ctx.lineTo(x3, y3);  //Point 2    (x, y)
    global.ctx.closePath();     //Close the path.
    //Fill triangle with previous set color.
    global.ctx.fill();
    //Give triangle a stroke (width: 4 pixels).
    global.ctx.strokeStyle = 'black';
    global.ctx.lineWidth   = 1;
    global.ctx.stroke();
}


function buildArrays(points){
	outerPoints=[];
	innerPoints=[];
	outerXs=[];
	outerYs=[];
	innerXs=[];
	innerYs=[];
	for (i=0; i<points; i++) {
		var a = irandom(global.increments-1)+1;
		var b = irandom(global.increments-1)+1;
		var out; var ins;
		while (b == a ) { b = irandom(global.increments) ; }
		if (a>b) { 
			out = a;
			ins = b;
		} else {
			out = b;
			ins = a;
		}
		outerPoints.push(out);
		innerPoints.push(ins);
		console.log("Outer = " + out + "\nInner = "+ins );
	}
}



function drawAddress(){
    var canvas = document.getElementById('canvas');
    var c = canvas.getContext('2d');
    drawTriangle(c,50, 25,100, 50,50, 75,"yellow");
	//create a list of dots
	
} 

function drawTriangle(c,x1,y1,x2,y2,x3,y3,color){
    c.fillStyle = color;
    c.beginPath();     //Begin a path..
    c.moveTo(x1, y1);  //Startpoint (x1, y1)
    c.lineTo(x2, y2); //Point 1    (x, y)
    c.lineTo(x3, y3);  //Point 2    (x, y)
    c.closePath();     //Close the path.
    //Fill triangle with previous set color.
    c.fill();
    //Give triangle a stroke (width: 4 pixels).
    c.strokeStyle = 'red'
    c.lineWidth   = 1;
    c.stroke();
}


function irandom(max){
	return getRandomIntInclusive(0,max);
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}