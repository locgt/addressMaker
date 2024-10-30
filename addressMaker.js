const message = '' // Try edit me
//use this URL to fill with hashmarks: https://stackoverflow.com/questions/17518107/creating-html5-canvas-patterns-and-filling-stuff-with-them 

const global = {increments:16, spokes:16, showAddress: false, graphType: "radial", plotOrigin: false, radialdots: 0};

global.patternImage = new Image();
global.patternImage.src = 'hash.png'; // Replace with the correct path to your image


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
	global.border=20;
	global.canvas = document.getElementById('canvas');
	global.room_width=canvas.width-global.border;
	global.room_height=canvas.height-global.border;
	global.centerX=canvas.width/2;
	global.centerY=canvas.height/2;
    global.ctx = global.canvas.getContext('2d');
	
	global.pattern=global.ctx.createPattern(global.patternImage, 'repeat');
	
	global.circle=false;
	global.circles=false;
	global.radials=false;
	global.fill=true;
	global.lineWidth=1;
	buildArrays(global.spokes);
	plotArrays(global.graphType);

}

function keyDown(evt) {
	console.log("Keydown event: "+evt.key);
	global.ctx.clearRect(0, 0, canvas.width, canvas.height);
	if(evt.key == "l") {global.graphType="linear";}
	if(evt.key == "r") {global.graphType="radial";}
	if(evt.key == "a") {global.showAddress = ! global.showAddress;}
	if(evt.key == " ") {buildArrays(global.spokes);}
	if(evt.key == "s") {global.spokes--; buildArrays(global.spokes);}
	if(evt.key == "S") {global.spokes++; buildArrays(global.spokes);}
	if(evt.key == "i") {global.increments--; buildArrays(global.spokes);}
	if(evt.key == "I") {global.increments++; buildArrays(global.spokes);}
	if(evt.key == "o") {global.plotOrigin = ! global.plotOrigin; }
	if(evt.key == "c") {global.circle= ! global.circle; }
	if(evt.key == "C") {global.circles= ! global.circles; }
	if(evt.key == "R") {global.radials= ! global.radials; }
	if(evt.key == "d") {global.radialdots++; if (global.radialdots>2) {global.radialdots=0} }
	if(evt.key == "f") {global.fill= ! global.fill; }
	if(evt.key == "w") {global.lineWidth=Math.max(global.lineWidth-1,1);}
	if(evt.key == "W") {global.lineWidth++; }
	if(evt.key == "b") {global.BWFill =! global.BWFill; }
	if(evt.key == "F") {global.filter =! global.filter; }

	if(evt.key == "t") {
		var tmpOuter=getNumbersAsArray(global.spokes, global.increments, "Outer Array: ");
		if (tmpOuter != null) {
			outerPoints=tmpOuter;
		}
	}
	if(evt.key == "n") {
		var tmpInner=getNumbersAsArray(global.spokes, global.increments, "Inner Array: ");
		if (tmpInner != null) {
			innerPoints=tmpInner;
		}
	}
	
	return plotArrays(global.graphType);
}

function getNumbersAsArray(globalSpokes, globalIncrements, promptPrefix) {
  const input = prompt(promptPrefix+"Enter "+globalSpokes+ " numbers from 1 to "+globalIncrements+" separated by commas");
  if (input === null) {
    return null; // User canceled the input
  }
  const numbers = input.split(",");
  // Filter out empty strings, non-numeric values, and numbers outside the range
  const validNumbers = numbers.filter(num => {
    return num !== "" && !isNaN(num) && Number(num) >= 1 && Number(num) <= globalIncrements;
  });

  // Check if the number of valid numbers matches globalSpokes
  if (validNumbers.length !== globalSpokes) {
    alert(`Please enter exactly ${globalSpokes} numbers that are from 1 to ${globalIncrements}.`);
    return null;
  }
  // Convert remaining strings to numbers
  const numericArray = validNumbers.map(num => Number(num));
  return numericArray;
}


function plotArrays(type){
	//clear the canvas	
	global.ctx.clearRect(0,0,global.room_width, global.room_height);
	global.ctx.filter = 'none';

	//draw the plot
	if(type=="radial") { plotArraysRadial(); }
	if(type=="linear") { plotArraysLinear(); }
	printAddress();
	if(global.plotOrigin) { plotOrigin(); }
	if(global.filter) {
		console.log("Applying filter");
		// Apply the pencil sketch filter
		global.ctx.filter = 'blur(1px) grayscale(1)';
		// Redraw the canvas to apply the filter
		global.ctx.drawImage(canvas, 0, 0);
	}
}

function plotOrigin() {
	global.ctx.fillStyle = "black";
	line(outerXs[0],outerYs[0],innerXs[0],innerYs[0])
}


function printAddress(){
	console.log("printing address");
	global.ctx.font = "20px Arial";
	global.ctx.fillStyle = "black";
	global.ctx.textAlign = "center";
	var outerAddr="Outer: "+outerPoints.join(",");	
	var innerAddr="Inner: "+innerPoints.join(",");
	var lineWidth="LineWidth: "+global.lineWidth;
	document.getElementById("AdressText").innerHTML=outerAddr+"<br>"+innerAddr+"<br> Spokes: "+global.spokes+"<br>Increments: "+global.increments+"<br> "+lineWidth;
	if(global.showAddress) {
		global.ctx.fillText(outerAddr, centerX, global.room_height-25);
		global.ctx.fillText(innerAddr, centerX, centerY);
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

		outerX=(global.centerX)+(Math.sin(i*0.0174533)*(outer*x_scale));
		outerY=(global.centerY)+(Math.cos(i*0.0174533)*(outer*y_scale));
		outerXs[ind]=outerX;
		outerYs[ind]=outerY;
		//circle( outerX, outerY, "green");
		
		innerX=(global.centerX)+(Math.sin(i*0.0174533)*(inner*x_scale));
		innerY=(global.centerY)+(Math.cos(i*0.0174533)*(inner*y_scale));
		//circle(innerX , innerY, "red");
		innerXs[ind]=innerX;
		innerYs[ind]=innerY;
		
		ind++;
	}

	if(global.BWFill ){
		traceAndFill(outerXs, outerYs, 'white', 'black');
		//traceAndFillPattern(outerXs, outerYs, 'black');
		//traceAndFill(innerXs, innerYs, 'white', 'black');
		traceAndFillPattern(innerXs, innerYs, 'black');
	} else {
		traceAndFill(outerXs, outerYs, 'red', 'black');
		traceAndFill(innerXs, innerYs, 'white', 'black');
	}
	
	

	if(global.circle == true) {
		drawOuterCircle();
	}
	if(global.circles == true) {
		drawCircles();
		drawOuterCircle();
	}
	if(global.radials == true) {
		drawRadials();
	}
	if(global.radialdots) {
		drawRadialDots();
	}
	
}

function plotArraysLinear(){
	console.log("Plotting linear address");
	var ind=0;  //index for arrays from 0 to spokes.
	var linear_x_scale=global.room_width/global.spokes;
	var y_scale=(global.centerY)/global.increments;

	while(ind < outerPoints.length) {
		outerXs[ind] = (ind * linear_x_scale)+linear_x_scale/2;
		outerYs[ind] = (global.centerY)-((y_scale*global.increments)/2)+(outerPoints[ind]*y_scale);
		//circle(outerXs[ind],outerYs[ind],'black');
		
		innerXs[ind] = (ind * linear_x_scale)+linear_x_scale/2;
		innerYs[ind] = (global.centerY)-((y_scale*global.increments)/2)+(innerPoints[ind]*y_scale);
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

function drawOuterCircle(){
	circle(global.centerX, global.centerY, (global.room_height/2)-(global.lineWidth/2), 'black', global.lineWidth+1);
	return;
}

function drawCircles() {
	//draw the circles from center to outer in light gray
	var y_scale=(global.room_height/2)/global.increments;
	for (var i=0; i<global.increments ;i++) {
		circle(global.centerX, global.centerY, i*y_scale, 'Thistle', 1);
	
	}
}

function drawRadials(){
	var x_scale=(global.room_width/2)/global.increments;
	var y_scale=(global.room_height/2)/global.increments;
	for (var i=0; i<360 ;i+=(360/global.spokes)) {
		outerX=(global.centerX)+(Math.sin(i*0.0174533)*(global.increments*x_scale));
		outerY=(global.centerY)+(Math.cos(i*0.0174533)*(global.increments*y_scale));
		global.ctx.strokeStyle = 'Thistle'; 
		global.ctx.lineWidth   = 1;
		line(global.centerX,global.centerY,outerX,outerY);
	}	
}

function drawRadialDots(){
	var x_scale=(global.room_width/2)/global.increments;
	var y_scale=(global.room_height/2)/global.increments;
	var ind=0;
	for (var i=0; i<360 ;i+=(360/global.spokes)) {
		outer = outerPoints[ind];
		//console.log("outer=" + outer);
		//console.log("global.increments=" + global.increments);

		outerX=(global.centerX)+(Math.sin(i*0.0174533)*(global.increments*x_scale));
		outerY=(global.centerY)+(Math.cos(i*0.0174533)*(global.increments*y_scale));
		//global.ctx.strokeStyle = 'Thistle'; 
		global.ctx.lineWidth   = 1;
		//line(global.room_width/2,global.room_height/2,outerX,outerY);
		if(outer==global.increments && global.radialdots == 2) { //only draw where the radial is max (touches the circle)
			circle (outerX,outerY, 1, 'black', global.lineWidth*3);
		}
		if(global.radialdots ==1 )		{ //draww all dots
			circle (outerX,outerY, 1, 'black', global.lineWidth*3);
		}
		ind++;
	}		
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
    if(global.fill) {
		//global.ctx.fillStyle=global.pattern;
		global.ctx.fill(); 
	}
    //Give triangle a stroke (width: 4 pixels).
    global.ctx.strokeStyle = lineColor;
    global.ctx.lineWidth   = global.lineWidth;
    global.ctx.stroke();
}

function traceAndFillPattern(Xs, Ys, lineColor){
    global.ctx.fillStyle = global.pattern;
    global.ctx.beginPath();     //Begin a path..
    global.ctx.moveTo(Xs[0], Ys[0]);  //Startpoint (x1, y1)
	var i=1;
	while( i < Xs.length ) {
		global.ctx.lineTo(Xs[i], Ys[i]); //Point i    (x, y)
		i++;
	}
    global.ctx.closePath();     //Close the path.
    //Fill triangle with previous set color.
    if(global.fill) {
		global.ctx.fill(); 
	}
    //Give triangle a stroke (width: 4 pixels).
    global.ctx.strokeStyle = lineColor;
    global.ctx.lineWidth   = global.lineWidth;
    global.ctx.stroke();
}



function circle (x, y, radius, color, thickness){
	global.ctx.beginPath();
	global.ctx.strokeStyle = color; 
	global.ctx.lineWidth = thickness;
	global.ctx.arc(x,y,radius, 0, 2 * Math.PI);
	global.ctx.stroke();
	return;
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
