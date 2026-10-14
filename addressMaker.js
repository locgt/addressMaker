const message = '' // Try edit me
//use this URL to fill with hashmarks: https://stackoverflow.com/questions/17518107/creating-html5-canvas-patterns-and-filling-stuff-with-them 

global = {increments:16, spokes:16, showAddress: false, graphType: "radial", plotOrigin: false, radialdots: 0};
	global.circle=true;
	global.circles=false;
	global.radials=false;
	global.fill=true;
	global.lineWidth=4;
	global.editMode=false;
	global.BWFill=false;
	global.filter=false;
	loadData();

global.patternImage = new Image();
global.patternImage.src = 'hash.png'; // Replace with the correct path to your image
global.patternImageLoaded = false;
global.patternImage.onload = function() {
	global.patternImageLoaded = true;
	if (global.ctx) {
		global.pattern = global.ctx.createPattern(global.patternImage, 'repeat');
	}
};

//state saved before entering edit mode
global.editSaved = null;
global.dragging = null;        // {ring:'outer'|'inner', ind:N, ringInd:N}
global.editHitRadius = 10;

// Batch State
let batchState = {
	items: [],            // [{ index, chapterNum, fileName, outer, inner, raw, spokes, increments }]
	activeEditIndex: null,// currently editing chapter index in main canvas
	settings: {
		usePreset: true,
		lineWidth: 4,
		fillStyle: 'bw',   // 'bw' or 'color'
		radialdots: 2,     // 2: outer intersection only, 1: all, 0: none
		outerCircle: true,
		resolution: 600,
		filePrefix: 'chapter',
		startNumber: 1
	}
};

window.addEventListener('load', main);
window.addEventListener('keydown', keyDown, false);

outerPoints=[];
outerXs=[];
outerYs=[];
innerPoints=[];
innerXs=[];
innerYs=[];

function copyTextToClipboard(textToCopy) {
  const textArea = document.createElement('textarea');
  textArea.value = textToCopy;
  textArea.style.position = 'fixed';
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.select();
  textArea.setSelectionRange(0, textArea.value.length);
  document.execCommand('copy');
  document.body.removeChild(textArea);
}

function loadData(){
	console.log("Loading data");
	var storedData=localStorage.getItem("AddressMakerSettings");
	if (storedData) {
		try {
			var decodedData = JSON.parse(storedData);
			global = Object.assign(global, decodedData);
			console.log(decodedData);
		} catch (e) {
			console.error("Error loading stored data", e);
		}
	} else {
		console.log("No data found in local storage");
	}
}

function saveData(){
	console.log("Saving Data");
	const encodedData = JSON.stringify(global);
	localStorage.setItem("AddressMakerSettings", encodedData);
}

function main(){
	global.border=20;
	global.canvas = document.getElementById('canvas');
	global.room_width=canvas.width-global.border;
	global.room_height=canvas.height-global.border;
	global.centerX=canvas.width/2;
	global.centerY=canvas.height/2;
	global.ctx = global.canvas.getContext('2d');
	
	if (global.patternImage.complete && global.patternImage.naturalWidth > 0) {
		global.pattern = global.ctx.createPattern(global.patternImage, 'repeat');
	}
	
	global.canvas.addEventListener('mousedown', editMouseDown);
	global.canvas.addEventListener('mousemove', editMouseMove);
	global.canvas.addEventListener('mouseup',   editMouseUp);
	global.canvas.addEventListener('mouseleave',editMouseUp);

	buildArrays(global.spokes);
	plotArrays(global.graphType);
	saveData();
}

function keyDown(evt) {
	// If typing inside an input or textarea, ignore canvas hotkeys
	if (evt.target && (evt.target.tagName === 'INPUT' || evt.target.tagName === 'TEXTAREA' || evt.target.tagName === 'SELECT')) {
		if (evt.key === "Escape") {
			evt.target.blur();
			closeBatchModal();
		}
		return;
	}

	console.log("Keydown event: "+evt.key);

	if (evt.key === "Escape") {
		closeBatchModal();
		return;
	}

	// Open Batch Modal on Shift+B ('B')
	if (evt.key === "B") {
		openBatchModal();
		return;
	}

	if(evt.key == "e") {
		global.ctx.clearRect(0, 0, canvas.width, canvas.height);
		toggleEditMode();
		saveData();
		return;
	}

	if(global.editMode && evt.key != "k") {
		return;
	}

	global.ctx.clearRect(0, 0, canvas.width, canvas.height);
	if(evt.key == "l") {global.graphType="linear";}
	if(evt.key == "r") {global.graphType="radial";}
	if(evt.key == "a") {global.showAddress = ! global.showAddress;}
	if(evt.key == " ") {buildArrays(global.spokes);}
	if(evt.key == "s") {global.spokes=Math.max(3, global.spokes-1); buildArrays(global.spokes);}
	if(evt.key == "S") {global.spokes++; buildArrays(global.spokes);}
	if(evt.key == "i") {global.increments=Math.max(2, global.increments-1); buildArrays(global.spokes);}
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
	if(evt.key == "k") {
		var outerAddr="Outer: "+outerPoints.join(",");	
		var innerAddr="Inner: "+innerPoints.join(",");
		var textToCopy=outerAddr+" "+innerAddr;
		console.log("Sending to Clipboard: "+textToCopy);
		copyTextToClipboard(textToCopy);
		var notification = document.getElementById('notification');
		notification.style.visibility='visible';
		setTimeout(() => {
			notification.style.visibility='hidden';
		}, 3000);
	}

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
	if(evt.key =="A") {
		[outerPoints,innerPoints]=getWholeAddressAsArray(global.spokes, global.increments, "Enter a whole address");
		if (outerPoints == null || innerPoints == null) {
			alert(`Invalid input format. Randomizing arrays.`);
			buildArrays(global.spokes);
			return;
		}
	}
	saveData();
	return plotArrays(global.graphType);
}

// ================= EDIT MODE =================

function toggleEditMode() {
	global.editMode = !global.editMode;
	if(global.editMode) {
		global.editSaved = {
			graphType: global.graphType,
			circle:    global.circle,
			circles:   global.circles,
			radials:   global.radials,
			radialdots:global.radialdots,
			plotOrigin:global.plotOrigin,
			fill:      global.fill,
			BWFill:    global.BWFill,
			filter:    global.filter
		};
		global.graphType = "radial";
		global.circle  = true;
		global.circles = true;
		global.radials = true;
		global.radialdots = 1;
		global.plotOrigin = false;
		global.filter   = false;
		global.dragging = null;
		console.log("Edit mode ON");
		document.getElementById('EditBanner').style.visibility='visible';
	} else {
		var s = global.editSaved;
		if(s) {
			global.graphType = s.graphType;
			global.circle    = s.circle;
			global.circles   = s.circles;
			global.radials   = s.radials;
			global.radialdots= s.radialdots;
			global.plotOrigin= s.plotOrigin;
			global.fill      = s.fill;
			global.BWFill    = s.BWFill;
			global.filter    = s.filter;
		}
		global.dragging = null;
		global.editSaved = null;
		console.log("Edit mode OFF — arrays kept");
		document.getElementById('EditBanner').style.visibility='hidden';
	}
	plotArrays(global.graphType);
	if(global.editMode) drawEditHandles();
}

function recomputeCoords() {
	if(global.graphType == "radial") {
		var ind=0;
		var x_scale=(global.room_width/2)/global.increments;
		var y_scale=(global.room_height/2)/global.increments;
		for(var i=0; i<360; i+=(360/global.spokes)) {
			var outer=outerPoints[ind], inner=innerPoints[ind];
			outerXs[ind]=(global.centerX)+(Math.sin(i*0.0174533)*(outer*x_scale));
			outerYs[ind]=(global.centerY)+(Math.cos(i*0.0174533)*(outer*y_scale));
			innerXs[ind]=(global.centerX)+(Math.sin(i*0.0174533)*(inner*x_scale));
			innerYs[ind]=(global.centerY)+(Math.cos(i*0.0174533)*(inner*y_scale));
			ind++;
		}
	}
}

function mousePos(evt) {
	var rect = global.canvas.getBoundingClientRect();
	var scaleX = global.canvas.width  / rect.width;
	var scaleY = global.canvas.height / rect.height;
	return {
		x: (evt.clientX - rect.left) * scaleX,
		y: (evt.clientY - rect.top)  * scaleY
	};
}

function dist2(ax,ay,bx,by) {
	var dx=ax-bx, dy=ay-by;
	return dx*dx+dy*dy;
}

function findNearestDot(mx,my) {
	var best=null, bestD=global.editHitRadius*global.editHitRadius;
	for(var ring=0; ring<2; ring++) {
		var xs = (ring==0)?outerXs:innerXs;
		var ys = (ring==0)?outerYs:innerYs;
		for(var i=0; i<xs.length; i++) {
			var d=dist2(mx,my,xs[i],ys[i]);
			if(d<=bestD) { bestD=d; best={ring: ring, ind: i}; }
		}
	}
	return best;
}

function editMouseDown(evt) {
	if(!global.editMode) return;
	var p=mousePos(evt);
	var hit=findNearestDot(p.x,p.y);
	if(hit) {
		global.dragging=hit;
		console.log("Grabbed "+(hit.ring==0?"outer":"inner")+" #"+hit.ind);
	}
}

function editMouseUp(evt) {
	global.dragging=null;
}

function editMouseMove(evt) {
	if(!global.editMode || !global.dragging) return;
	var p=mousePos(evt);
	var d=global.dragging;
	var dx=p.x-global.centerX, dy=p.y-global.centerY;
	var distPx=Math.sqrt(dx*dx+dy*dy);
	var x_scale=(global.room_width/2)/global.increments;
	var y_scale=(global.room_height/2)/global.increments;
	var scale=Math.max(x_scale,y_scale);
	var raw=Math.round(distPx/scale);
	if(raw<1) raw=1;
	if(raw>global.increments) raw=global.increments;
	var otherVal=(d.ring==0)?innerPoints[d.ind]:outerPoints[d.ind];
	if(d.ring==0) {
		if(raw<=otherVal) raw=otherVal+1;
		outerPoints[d.ind]=raw;
	} else {
		if(raw>=otherVal) raw=otherVal-1;
		if(raw<1) raw=1;
		innerPoints[d.ind]=raw;
	}
	recomputeCoords();
	plotArrays(global.graphType);
	drawEditHandles();
}

function drawEditHandles() {
	var c=global.ctx;
	for(var i=0;i<outerXs.length;i++) {
		c.beginPath();
		c.fillStyle='blue';
		c.arc(outerXs[i],outerYs[i],6,0,2*Math.PI);
		c.fill();
		c.strokeStyle='white';
		c.lineWidth=1;
		c.stroke();
		c.beginPath();
		c.fillStyle='orange';
		c.arc(innerXs[i],innerYs[i],6,0,2*Math.PI);
		c.fill();
		c.strokeStyle='white';
		c.lineWidth=1;
		c.stroke();
	}
	if(global.dragging) {
		var d=global.dragging;
		var xs=(d.ring==0)?outerXs:innerXs;
		var ys=(d.ring==0)?outerYs:innerYs;
		c.beginPath();
		c.strokeStyle='yellow';
		c.lineWidth=2;
		c.arc(xs[d.ind],ys[d.ind],9,0,2*Math.PI);
		c.stroke();
	}
}

function getNumbersAsArray(globalSpokes, globalIncrements, promptPrefix) {
  const input = prompt(promptPrefix+"Enter "+globalSpokes+ " numbers from 1 to "+globalIncrements+" separated by commas");
  if (input === null) {
    return null;
  }
  const numbers = input.split(",");
  const validNumbers = numbers.filter(num => {
    return num !== "" && !isNaN(num) && Number(num) >= 1 && Number(num) <= globalIncrements;
  });

  if (validNumbers.length !== globalSpokes) {
    alert(`Please enter exactly ${globalSpokes} numbers that are from 1 to ${globalIncrements}.`);
    return null;
  }
  return validNumbers.map(num => Number(num));
}

function getWholeAddressAsArray(globalSpokes, globalIncrements, promptPrefix) {
  const input = prompt("Enter a whole address on one line like: 'Outer: 9,10,12,15,14,2,16,3,9,3,15,8,5,15,16,5 Inner: 1,8,4,12,6,1,8,2,7,2,7,3,3,4,1,2'");
  if (input == null) {
    return null;
  }
  return parseSingleAddressString(input, globalSpokes, globalIncrements);
}

function parseSingleAddressString(str, expectedSpokes, expectedIncrements) {
  if (!str) return null;
  const cleanedString = str.trim().replace(/^"/, '').replace(/"$/, '');
  const lower = cleanedString.toLowerCase();
  
  if (!lower.includes("inner:") && !lower.includes("outer:")) {
    return null;
  }

  const innerIdx = lower.indexOf("inner:");
  const outerIdx = lower.indexOf("outer:");
  
  let outerPart = "";
  let innerPart = "";
  
  if (outerIdx !== -1 && innerIdx !== -1 && outerIdx < innerIdx) {
    outerPart = cleanedString.substring(outerIdx + 6, innerIdx);
    innerPart = cleanedString.substring(innerIdx + 6);
  } else if (outerIdx !== -1 && innerIdx !== -1 && innerIdx < outerIdx) {
    innerPart = cleanedString.substring(innerIdx + 6, outerIdx);
    outerPart = cleanedString.substring(outerIdx + 6);
  } else {
    return null;
  }

  const outerNumbers = (outerPart.match(/\d+/g) || []).map(Number);
  const innerNumbers = (innerPart.match(/\d+/g) || []).map(Number);

  if (outerNumbers.length === 0 || innerNumbers.length === 0) {
    return null;
  }

  if (expectedSpokes && (outerNumbers.length !== expectedSpokes || innerNumbers.length !== expectedSpokes)) {
    return null;
  }

  return [outerNumbers, innerNumbers];
}

// ================= CORE RENDERING FUNCTION =================
// Pure renderer usable by both main canvas and batch export offscreen canvases
function drawAddressOnCanvas(targetCanvas, outerPts, innerPts, opts) {
	const c = targetCanvas.getContext('2d');
	const width = targetCanvas.width;
	const height = targetCanvas.height;
	const border = opts.border !== undefined ? opts.border : (width * (20 / 600));
	const room_width = width - border;
	const room_height = height - border;
	const centerX = width / 2;
	const centerY = height / 2;
	
	const spokes = opts.spokes || outerPts.length || 16;
	const increments = opts.increments || 16;
	const lineWidth = opts.lineWidth !== undefined ? opts.lineWidth : 1;
	const BWFill = opts.BWFill !== undefined ? opts.BWFill : true;
	const fill = opts.fill !== undefined ? opts.fill : true;
	const radialdots = opts.radialdots !== undefined ? opts.radialdots : 0;
	const circleOn = opts.circle || false;
	const circlesOn = opts.circles || false;
	const radialsOn = opts.radials || false;
	const plotOriginOn = opts.plotOrigin || false;
	const filterOn = opts.filter || false;
	const graphType = opts.graphType || 'radial';
	const showAddress = opts.showAddress || false;

	c.clearRect(0, 0, width, height);
	c.filter = 'none';

	// Prepare pattern
	let pattern = null;
	if (global.patternImage && global.patternImage.complete && global.patternImage.naturalWidth > 0) {
		pattern = c.createPattern(global.patternImage, 'repeat');
	}

	const oXs = [];
	const oYs = [];
	const iXs = [];
	const iYs = [];

	if (graphType === "radial") {
		let ind = 0;
		const x_scale = (room_width / 2) / increments;
		const y_scale = (room_height / 2) / increments;
		
		for (let i = 0; i < 360; i += (360 / spokes)) {
			const outer = outerPts[ind] || 1;
			const inner = innerPts[ind] || 1;
			const rad = i * 0.0174533;
			
			oXs[ind] = centerX + (Math.sin(rad) * (outer * x_scale));
			oYs[ind] = centerY + (Math.cos(rad) * (outer * y_scale));
			iXs[ind] = centerX + (Math.sin(rad) * (inner * x_scale));
			iYs[ind] = centerY + (Math.cos(rad) * (inner * y_scale));
			ind++;
		}

		// Fill polygons
		if (BWFill) {
			// Outer polygon in white with black stroke
			tracePolygon(c, oXs, oYs, 'white', 'black', lineWidth, fill);
			// Inner polygon with hash pattern
			tracePolygon(c, iXs, iYs, pattern || 'white', 'black', lineWidth, fill);
		} else {
			tracePolygon(c, oXs, oYs, 'red', 'black', lineWidth, fill);
			tracePolygon(c, iXs, iYs, 'white', 'black', lineWidth, fill);
		}

		if (circleOn || circlesOn) {
			drawCircleOutline(c, centerX, centerY, (room_height / 2) - (lineWidth / 2), 'black', lineWidth + 1);
		}
		if (circlesOn) {
			const y_sc = (room_height / 2) / increments;
			for (let i = 0; i < increments; i++) {
				drawCircleOutline(c, centerX, centerY, i * y_sc, 'Thistle', 1);
			}
		}
		if (radialsOn) {
			const x_sc = (room_width / 2) / increments;
			const y_sc = (room_height / 2) / increments;
			for (let i = 0; i < 360; i += (360 / spokes)) {
				const rad = i * 0.0174533;
				const ox = centerX + (Math.sin(rad) * (increments * x_sc));
				const oy = centerY + (Math.cos(rad) * (increments * y_sc));
				c.beginPath();
				c.strokeStyle = 'Thistle';
				c.lineWidth = 1;
				c.moveTo(centerX, centerY);
				c.lineTo(ox, oy);
				c.stroke();
			}
		}
		if (radialdots > 0) {
			const x_sc = (room_width / 2) / increments;
			const y_sc = (room_height / 2) / increments;
			let indDot = 0;
			for (let i = 0; i < 360; i += (360 / spokes)) {
				const outer = outerPts[indDot] || 1;
				const rad = i * 0.0174533;
				const ox = centerX + (Math.sin(rad) * (increments * x_sc));
				const oy = centerY + (Math.cos(rad) * (increments * y_sc));
				
				if (outer === increments && radialdots === 2) {
					drawFilledCircle(c, ox, oy, lineWidth * 2, 'black');
				} else if (radialdots === 1) {
					drawFilledCircle(c, ox, oy, lineWidth * 2, 'black');
				}
				indDot++;
			}
		}
	} else if (graphType === "linear") {
		let ind = 0;
		const linear_x_scale = room_width / spokes;
		const y_scale = (centerY) / increments;
		while (ind < outerPts.length) {
			oXs[ind] = (ind * linear_x_scale) + linear_x_scale / 2;
			oYs[ind] = centerY - ((y_scale * increments) / 2) + (outerPts[ind] * y_scale);
			iXs[ind] = (ind * linear_x_scale) + linear_x_scale / 2;
			iYs[ind] = centerY - ((y_scale * increments) / 2) + (innerPts[ind] * y_scale);
			ind++;
		}
		const revOuterXs = [...oXs].reverse();
		const revOuterYs = [...oYs].reverse();
		tracePolygon(c, iXs.concat(revOuterXs), iYs.concat(revOuterYs), 'red', 'black', lineWidth, fill);
	}

	if (plotOriginOn && oXs.length > 0 && iXs.length > 0) {
		c.beginPath();
		c.strokeStyle = 'black';
		c.lineWidth = 1;
		c.moveTo(oXs[0], oYs[0]);
		c.lineTo(iXs[0], iYs[0]);
		c.stroke();
	}

	if (showAddress) {
		c.font = Math.round(width * (20 / 600)) + "px Arial";
		c.fillStyle = "black";
		c.textAlign = "center";
		const outerAddr = "Outer: " + outerPts.join(",");
		const innerAddr = "Inner: " + innerPts.join(",");
		c.fillText(outerAddr, centerX, room_height - 25);
		c.fillText(innerAddr, centerX, room_height);
	}

	if (filterOn) {
		c.filter = 'blur(1px) grayscale(1)';
		c.drawImage(targetCanvas, 0, 0);
	}

	return { oXs, oYs, iXs, iYs };
}

function tracePolygon(ctx, Xs, Ys, fillStyle, strokeColor, lineWidth, doFill) {
	if (!Xs || Xs.length === 0) return;
	ctx.beginPath();
	ctx.moveTo(Xs[0], Ys[0]);
	for (let i = 1; i < Xs.length; i++) {
		ctx.lineTo(Xs[i], Ys[i]);
	}
	ctx.closePath();
	if (doFill) {
		ctx.fillStyle = fillStyle;
		ctx.fill();
	}
	ctx.strokeStyle = strokeColor;
	ctx.lineWidth = lineWidth;
	ctx.stroke();
}

function drawCircleOutline(ctx, x, y, radius, color, thickness) {
	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.lineWidth = thickness;
	ctx.arc(x, y, Math.max(0, radius), 0, 2 * Math.PI);
	ctx.stroke();
}

function drawFilledCircle(ctx, x, y, radius, color) {
	ctx.beginPath();
	ctx.fillStyle = color;
	ctx.arc(x, y, Math.max(0, radius), 0, 2 * Math.PI);
	ctx.fill();
}

// ================= MAIN CANVAS PLOT =================
function plotArrays(type){
	if (!global.canvas) return;
	const res = drawAddressOnCanvas(global.canvas, outerPoints, innerPoints, {
		border: global.border,
		spokes: global.spokes,
		increments: global.increments,
		lineWidth: global.lineWidth,
		BWFill: global.BWFill,
		fill: global.fill,
		radialdots: global.radialdots,
		circle: global.circle,
		circles: global.circles,
		radials: global.radials,
		plotOrigin: global.plotOrigin,
		filter: global.filter,
		graphType: global.graphType,
		showAddress: global.showAddress
	});

	outerXs = res.oXs;
	outerYs = res.oYs;
	innerXs = res.iXs;
	innerYs = res.iYs;

	printAddress();
}

function printAddress(){
	var outerAddr="Outer: "+outerPoints.join(",");	
	var innerAddr="Inner: "+innerPoints.join(",");
	var lineWidth="LineWidth: "+global.lineWidth;
	var el = document.getElementById("AdressText");
	if (el) {
		el.innerHTML=outerAddr+"<br>"+innerAddr+"<br> Spokes: "+global.spokes+" Increments: "+global.increments+" "+lineWidth;
	}
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
	}
}

function irandom(max){
	return getRandomIntInclusive(0,max);
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// ================= BATCH EXPORTER LOGIC =================

function openBatchModal() {
	const modal = document.getElementById('batchModal');
	if (modal) {
		modal.classList.remove('hidden');
		const textarea = document.getElementById('batchAddressesText');
		if (textarea && !textarea.value.trim() && batchState.items.length === 0) {
			textarea.focus();
		}
	}
}

function closeBatchModal() {
	const modal = document.getElementById('batchModal');
	if (modal) {
		modal.classList.add('hidden');
	}
}

function togglePresetMode() {
	const usePreset = document.getElementById('usePresetCheck').checked;
	batchState.settings.usePreset = usePreset;
	const fields = document.getElementById('customSettingsFields');
	if (fields) {
		if (usePreset) {
			fields.classList.add('disabled');
			document.getElementById('batchLineWidth').value = 4;
			document.getElementById('batchFillStyle').value = 'bw';
			document.getElementById('batchRadialDots').value = '2';
			document.getElementById('batchOuterCircle').checked = true;
		} else {
			fields.classList.remove('disabled');
		}
	}
	if (batchState.items.length > 0) {
		renderBatchPreviews();
	}
}

function updateBatchSetting() {
	batchState.settings.lineWidth = parseInt(document.getElementById('batchLineWidth').value) || 4;
	batchState.settings.fillStyle = document.getElementById('batchFillStyle').value;
	batchState.settings.radialdots = parseInt(document.getElementById('batchRadialDots').value) || 0;
	batchState.settings.outerCircle = document.getElementById('batchOuterCircle').checked;
	batchState.settings.resolution = parseInt(document.getElementById('batchResolution').value) || 600;
	batchState.settings.filePrefix = document.getElementById('batchFilePrefix').value.trim() || 'chapter';
	batchState.settings.startNumber = parseInt(document.getElementById('batchStartNumber').value) || 1;

	if (batchState.items.length > 0) {
		// Update item names based on new prefix / start number
		batchState.items.forEach((item, index) => {
			const num = batchState.settings.startNumber + index;
			item.chapterNum = num;
			item.fileName = `${batchState.settings.filePrefix}${num}`;
		});
		renderBatchPreviews();
	}
}

function getBatchRenderOptions() {
	if (batchState.settings.usePreset) {
		return {
			lineWidth: 4,
			BWFill: true,
			fill: true,
			radialdots: 2,
			circle: true,
			circles: false,
			radials: false,
			plotOrigin: false,
			filter: false,
			graphType: 'radial',
			border: 20
		};
	} else {
		return {
			lineWidth: batchState.settings.lineWidth,
			BWFill: batchState.settings.fillStyle === 'bw',
			fill: true,
			radialdots: batchState.settings.radialdots,
			circle: batchState.settings.outerCircle,
			circles: false,
			radials: false,
			plotOrigin: false,
			filter: false,
			graphType: 'radial',
			border: 20
		};
	}
}

function parseBatchInputText(rawText) {
	if (!rawText) return [];
	const lines = rawText.split(/\r?\n/);
	const parsedItems = [];
	let currentNum = batchState.settings.startNumber || 1;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();
		if (!line) continue;

		// Extract address arrays from line
		const addressPair = parseSingleAddressString(line);
		if (addressPair && addressPair[0].length > 0 && addressPair[1].length > 0) {
			const outer = addressPair[0];
			const inner = addressPair[1];
			const spokes = outer.length;
			const maxVal = Math.max(...outer, ...inner);
			const increments = Math.max(16, maxVal);

			parsedItems.push({
				index: parsedItems.length,
				chapterNum: currentNum,
				fileName: `${batchState.settings.filePrefix || 'chapter'}${currentNum}`,
				outer: outer,
				inner: inner,
				spokes: spokes,
				increments: increments,
				raw: line
			});
			currentNum++;
		}
	}
	return parsedItems;
}

function parseAndPreviewBatch() {
	const rawText = document.getElementById('batchAddressesText').value;
	batchState.items = parseBatchInputText(rawText);

	const badge = document.getElementById('batchCountBadge');
	const downloadBtn = document.getElementById('downloadZipBtn');
	const statusMsg = document.getElementById('exportStatusMsg');

	if (batchState.items.length === 0) {
		badge.textContent = `0 chapters detected`;
		badge.style.background = '#f8d7da';
		badge.style.color = '#842029';
		downloadBtn.disabled = true;
		statusMsg.textContent = 'No valid address lines found. Format: Outer: ... Inner: ...';
		document.getElementById('batchPreviewGrid').innerHTML = `
			<div class="empty-preview-prompt">
				No valid addresses found in input. Make sure rows contain <code>Outer: ... Inner: ...</code>.
			</div>`;
		return;
	}

	badge.textContent = `${batchState.items.length} chapters detected`;
	badge.style.background = '#d1e7dd';
	badge.style.color = '#0f5132';
	downloadBtn.disabled = false;
	statusMsg.textContent = `Generated ${batchState.items.length} chapter previews. Ready to export.`;

	renderBatchPreviews();
}

function renderBatchPreviews() {
	const grid = document.getElementById('batchPreviewGrid');
	grid.innerHTML = '';

	const renderOpts = getBatchRenderOptions();
	const thumbSize = 200;

	batchState.items.forEach((item, idx) => {
		const card = document.createElement('div');
		card.className = 'chapter-card';
		card.id = `chapter-card-${idx}`;

		const header = document.createElement('div');
		header.className = 'chapter-card-header';
		header.textContent = `Chapter ${item.chapterNum} (${item.fileName}.png)`;

		const canvas = document.createElement('canvas');
		canvas.width = thumbSize;
		canvas.height = thumbSize;
		canvas.className = 'chapter-thumbnail';
		canvas.title = `Outer: ${item.outer.join(',')}\nInner: ${item.inner.join(',')}`;

		// Draw preview on thumbnail canvas
		drawAddressOnCanvas(canvas, item.outer, item.inner, {
			...renderOpts,
			border: thumbSize * (20 / 600),
			spokes: item.spokes,
			increments: item.increments
		});

		const actions = document.createElement('div');
		actions.className = 'chapter-actions';

		const editBtn = document.createElement('button');
		editBtn.className = 'small-btn';
		editBtn.textContent = '✏️ Edit';
		editBtn.title = 'Load into Main Canvas to tweak';
		editBtn.onclick = () => loadChapterIntoMainCanvas(idx);

		const downloadBtn = document.createElement('button');
		downloadBtn.className = 'small-btn';
		downloadBtn.textContent = '💾 PNG';
		downloadBtn.title = `Download ${item.fileName}.png`;
		downloadBtn.onclick = () => downloadSingleChapter(idx);

		actions.appendChild(editBtn);
		actions.appendChild(downloadBtn);

		card.appendChild(header);
		card.appendChild(canvas);
		card.appendChild(actions);
		grid.appendChild(card);
	});
}

function downloadSingleChapter(index) {
	const item = batchState.items[index];
	if (!item) return;

	const exportResolution = batchState.settings.resolution || 600;
	const offCanvas = document.createElement('canvas');
	offCanvas.width = exportResolution;
	offCanvas.height = exportResolution;

	const renderOpts = getBatchRenderOptions();
	drawAddressOnCanvas(offCanvas, item.outer, item.inner, {
		...renderOpts,
		border: exportResolution * (20 / 600),
		spokes: item.spokes,
		increments: item.increments
	});

	const dataUrl = offCanvas.toDataURL('image/png');
	const a = document.createElement('a');
	a.href = dataUrl;
	a.download = `${item.fileName}.png`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}

async function downloadAllChaptersZip() {
	if (!window.JSZip) {
		alert('JSZip library is not loaded. Please ensure jszip.min.js is in the folder.');
		return;
	}
	if (batchState.items.length === 0) {
		alert('No chapters to export. Please paste addresses and generate previews first.');
		return;
	}

	const downloadBtn = document.getElementById('downloadZipBtn');
	const statusMsg = document.getElementById('exportStatusMsg');
	const originalBtnText = downloadBtn.innerHTML;

	downloadBtn.disabled = true;
	downloadBtn.innerHTML = '⏳ Building ZIP...';
	statusMsg.textContent = 'Rendering chapters at full resolution...';

	try {
		const zip = new JSZip();
		const exportResolution = batchState.settings.resolution || 600;
		const renderOpts = getBatchRenderOptions();

		for (let i = 0; i < batchState.items.length; i++) {
			const item = batchState.items[i];
			statusMsg.textContent = `Rendering chapter ${item.chapterNum} of ${batchState.items.length}...`;

			const offCanvas = document.createElement('canvas');
			offCanvas.width = exportResolution;
			offCanvas.height = exportResolution;

			drawAddressOnCanvas(offCanvas, item.outer, item.inner, {
				...renderOpts,
				border: exportResolution * (20 / 600),
				spokes: item.spokes,
				increments: item.increments
			});

			const dataUrl = offCanvas.toDataURL('image/png');
			const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
			zip.file(`${item.fileName}.png`, base64Data, { base64: true });
		}

		statusMsg.textContent = 'Compressing into chapters.zip...';
		const content = await zip.generateAsync({ type: 'blob' });

		const blobUrl = URL.createObjectURL(content);
		const a = document.createElement('a');
		a.href = blobUrl;
		a.download = 'chapters.zip';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);

		statusMsg.textContent = `✅ Successfully exported ${batchState.items.length} chapters to chapters.zip!`;
	} catch (err) {
		console.error('Error generating zip:', err);
		statusMsg.textContent = `❌ Error exporting zip: ${err.message}`;
		alert('Failed to generate ZIP: ' + err.message);
	} finally {
		downloadBtn.disabled = false;
		downloadBtn.innerHTML = originalBtnText;
	}
}

function loadChapterIntoMainCanvas(index) {
	const item = batchState.items[index];
	if (!item) return;

	batchState.activeEditIndex = index;
	outerPoints = [...item.outer];
	innerPoints = [...item.inner];
	global.spokes = item.spokes;
	global.increments = item.increments;

	// Apply exact thumbnail render settings to main canvas
	const renderOpts = getBatchRenderOptions();
	global.BWFill = renderOpts.BWFill;
	global.fill = renderOpts.fill;
	global.lineWidth = renderOpts.lineWidth;
	global.radialdots = renderOpts.radialdots;
	global.circle = renderOpts.circle;
	global.circles = renderOpts.circles;
	global.radials = renderOpts.radials;
	global.plotOrigin = renderOpts.plotOrigin;
	global.filter = renderOpts.filter;
	global.graphType = renderOpts.graphType;

	recomputeCoords();
	plotArrays(global.graphType);
	closeBatchModal();

	// Show sync banner on main screen
	const banner = document.getElementById('BatchEditBanner');
	const msg = document.getElementById('BatchEditMsg');
	if (banner && msg) {
		banner.classList.remove('hidden');
		msg.textContent = `✏️ Editing Chapter ${item.chapterNum} (${item.fileName})`;
	}
}

function saveBatchEditToChapter() {
	if (batchState.activeEditIndex === null || !batchState.items[batchState.activeEditIndex]) {
		alert('No active chapter being edited from batch.');
		return;
	}

	const item = batchState.items[batchState.activeEditIndex];
	item.outer = [...outerPoints];
	item.inner = [...innerPoints];
	item.spokes = global.spokes;
	item.increments = global.increments;

	// Rebuild raw string
	item.raw = `Outer: ${item.outer.join(',')} Inner: ${item.inner.join(',')}`;

	// Update textarea in modal to reflect changes
	updateBatchTextareaFromItems();

	// Show brief notification
	const notification = document.getElementById('notification');
	notification.textContent = `Saved edits to Chapter ${item.chapterNum}!`;
	notification.style.visibility = 'visible';
	setTimeout(() => {
		notification.style.visibility = 'hidden';
		notification.textContent = 'Address copied!';
	}, 2500);

	renderBatchPreviews();
}

function updateBatchTextareaFromItems() {
	const textarea = document.getElementById('batchAddressesText');
	if (textarea && batchState.items.length > 0) {
		textarea.value = batchState.items.map(item => `Outer: ${item.outer.join(',')} Inner: ${item.inner.join(',')}`).join('\n');
	}
}

function loadSampleBatchData() {
	const sampleData = `Outer: 9,10,12,15,14,2,16,3,9,3,15,8,5,15,16,5 Inner: 1,8,4,12,6,1,8,2,7,2,7,3,3,4,1,2
Outer: 10,14,16,15,12,14,15,11,10,14,12,14,15,16,12,15 Inner: 6,10,3,9,8,1,4,8,4,3,2,6,1,7,4,9
Outer: 15,11,13,16,14,15,14,13,15,16,12,14,15,13,15,14 Inner: 3,7,2,5,7,1,8,9,3,4,8,6,2,5,8,1
Outer: 16,12,15,14,13,15,16,12,14,15,13,15,14,16,15,12 Inner: 4,8,1,6,5,2,7,8,2,3,7,5,1,4,7,3`;
	
	document.getElementById('batchAddressesText').value = sampleData;
	parseAndPreviewBatch();
}


function saveBatchProjectToFile() {
  const data = {
    addresses: document.getElementById('batchAddressesText').value,
    settings: batchState.settings
  };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'addressMaker_project.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
  const notification = document.getElementById('exportStatusMsg');
  notification.textContent = 'Project settings saved to addressMaker_project.json!';
  setTimeout(() => { notification.textContent = 'Ready to generate.'; }, 3000);
}

function loadBatchProjectFromFile(event) {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.addresses) {
        document.getElementById('batchAddressesText').value = data.addresses;
      }
      if (data.settings) {
        batchState.settings = { ...batchState.settings, ...data.settings };
        // Update UI elements based on loaded settings
        document.getElementById('usePresetCheck').checked = batchState.settings.usePreset;
        document.getElementById('batchLineWidth').value = batchState.settings.lineWidth;
        document.getElementById('batchFillStyle').value = batchState.settings.fillStyle;
        document.getElementById('batchRadialDots').value = batchState.settings.radialdots;
        document.getElementById('batchOuterCircle').checked = batchState.settings.outerCircle;
        document.getElementById('batchResolution').value = batchState.settings.resolution;
        document.getElementById('batchFilePrefix').value = batchState.settings.filePrefix;
        document.getElementById('batchStartNumber').value = batchState.settings.startNumber;
        togglePresetMode(); // Re-apply preset mode visual state
      }
      parseAndPreviewBatch();
      const notification = document.getElementById('exportStatusMsg');
      notification.textContent = 'Project settings loaded successfully!';
      setTimeout(() => { notification.textContent = 'Ready to generate.'; }, 3000);
    } catch (error) {
      console.error('Error loading project file:', error);
      alert('Failed to load project file. Please ensure it\'s a valid JSON.');
      const notification = document.getElementById('exportStatusMsg');
      notification.textContent = 'Error loading project file.';
      setTimeout(() => { notification.textContent = 'Ready to generate.'; }, 3000);
    }
  };
  reader.readAsText(file);
}

