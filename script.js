console.log("Connected");



var canvas = document.getElementById("testCanvas");
var context = canvas.getContext("2d");

var CANVAS_WIDTH = 700;
var CANVAS_HEIGHT = 400;

let Mode = "create"; //modes:  create drag delete animate
let Circles = [];
let LoopIndex = 0;
let Drag = -1;
let Edges = [];
context.font = "30px Arial";
let TableNode = null;
let EdgeState = 'P1';
let animation = [];
let overrideColor = [];
let n1, n2, AnimSpeed=1000, FirstTime=true;

canvas.onmousedown = function (e) {
	
	if (Mode == 'drag') {
		var pos = getMousePos(canvas, e);
		var n = getNearestCircle(pos);

		if (n.index >= 0 && n.distance < 30) {
			Drag = n.index;
		}
	}
}

canvas.onmousemove = function (e) {
	if (Mode == 'drag') {
		if (Drag >= 0) {
			Circles[Drag].pos = getMousePos(canvas, e);
        }
	}
}
canvas.onmouseup = function (e) {
	if (Mode == 'drag') {
		if (Drag >= 0) {
			Circles[Drag].pos = getMousePos(canvas, e);
			Drag = -1;
			CheckConnectivity();
		}
	}
}

canvas.onclick = function (e) {
	
    var pos = getMousePos(canvas, e);

	switch (Mode) {
		case 'create': Create(pos); break;
		case 'delete': Delete(pos); break;
		case 'animate': CreateAnimation(pos); break;
		case 'createEdge': CreateEdge(pos); break;
	}
	CheckConnectivity();
	
	let m = CreateMatrix();
	createTable(m);
}


function Create(pos) {
	
		var color = randomColor();

		Circles.push({ pos: pos, color: color });
		//AddNewEdges();

		console.log("Number Of circles = " + Circles.length);
		console.log("Current circle pos = " + pos.x + " " + pos.y);
}

function Delete(pos) {
	var n = getNearestCircle(pos);
	if (n.index >= 0 && n.distance < 30) {
		Circles.splice(n.index, 1);
		console.log("Deleted " + n.index);
		DeleteEdgesFrom(n.index);
	}

	n = getNearestEdge(pos);
	if (n.index >= 0 && n.distance < 9) {
		Edges.splice(n.index, 1);
	}
	
}

function DeleteEdgesFrom(n) {
	let res = [];
	for (var e of Edges) {
		if (e.from != n && e.to != n)
			res.push({ from: e.from<n?e.from:e.from-1, to: e.to<n?e.to:e.to-1 });
	}
	Edges = res;

}


function randomColor() {
    var color = [];
    for (var i = 0; i < 3; i++) {
        color.push(Math.floor(Math.random() * 256));
    }
    return 'rgb(' + color.join(',') + ')';
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function CreateEdge(pos) {
	if (EdgeState == 'P1') { n1 = getNearestCircle(pos).index; EdgeState = 'P2'; return; }
	if (EdgeState == 'P2') {
		n2 = getNearestCircle(pos).index;
		Edges.push({ from: n1, to: n2 });
		EdgeState = 'P1'
	}
}

function draw() {
  context.globalCompositeOperation = 'destination-over';
  context.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT); 


	for (var i = 0; i < Circles.length; i++) {
		var c = Circles[i];
	  context.fillStyle = overrideColor[i]? overrideColor[i] : c.color;

	  context.beginPath();
	  context.arc(c.pos.x, c.pos.y, 30, 0, 2 * Math.PI);
	  context.fill();

	  context.beginPath();
	  context.fillStyle = "Black";
		context.fillText(i, c.pos.x + 30, c.pos.y);


	}

	for (var c of Edges) {
		let x1 = Circles[c.from].pos.x;
		let y1 = Circles[c.from].pos.y;
		let x2 = Circles[c.to].pos.x;
		let y2 = Circles[c.to].pos.y;


		context.strokeStyle = 'Black';
		context.beginPath();
		context.moveTo(x1, y1);
		context.lineTo(x2, y2);
		context.stroke();

		if (Mode == 'delete') {

			context.globalCompositeOperation = 'source-over';
			let MiddleX = (x1 + x2) / 2
			let MiddleY = (y1 + y2) / 2

			context.fillStyle = "Black";
			context.beginPath();
			context.arc(MiddleX, MiddleY, 7, 0, 2 * Math.PI);
			context.fill();


			context.strokeStyle = 'white';
			context.beginPath();
			context.moveTo(MiddleX-4, MiddleY-4);
			context.lineTo(MiddleX+4, MiddleY+4);
			context.stroke();

			context.beginPath();
			context.moveTo(MiddleX-4, MiddleY+4);
			context.lineTo(MiddleX+4, MiddleY-4);
			context.stroke();
			context.globalCompositeOperation = 'destination-over';
		}
		
	}		

	window.requestAnimationFrame(draw);
}

function distance( pos1, pos2 ) {
	var dx = pos1.x - pos2.x;
	var dy = pos1.y - pos2.y;
	return Math.sqrt( dx*dx + dy*dy );	
}

function getNearestCircle( pos ) {
 	var res = -1;	
	var d = 0;
	for ( var i = 0; i < Circles.length; i++ )
	{
		var d1 = distance(pos, Circles[i].pos);
		if (res == -1 || d1 < d ) 
		{
			res = i;
			d = d1;
		}
 	}
	return { index: res, distance : d };
}

function zeros(dimensions) {
	var array = [];

	for (var i = 0; i < dimensions[0]; ++i) {
		array.push(dimensions.length == 1 ? 0 : zeros(dimensions.slice(1)));
	}

	return array;
}

function createTable(tableData) {
	if (TableNode != null) {
		TableNode.remove();
	}
	var table = document.createElement('table');
	TableNode = table;
	var tableBody = document.createElement('tbody');

	tableData.forEach(function (rowData) {
		var row = document.createElement('tr');

		rowData.forEach(function (cellData) {
			var cell = document.createElement('td');
			cell.appendChild(document.createTextNode(cellData));
			row.appendChild(cell);
		});

		tableBody.appendChild(row);
	});

	table.appendChild(tableBody);
	//document.body.appendChild(table);
	document.getElementById('MatrixDiv').appendChild(table);

}

/*function //AddNewEdges() {

	var from = Circles.length - 1;
	for (var i = 0; i < Circles.length - 1; i++) {

		Edges.push({ from: from, to: i });
		
	}
	console.log(Edges);

}*/

function ChangeMode(mode) {
	Mode = mode;

	animation = [];
	overrideColor = [];

	if ( mode == "animate")
	{
		if (FirstTime) { alert('Choose where to start'); FirstTime = false; }
	}
}

function getNearestEdge(pos) {
	var res = -1;
	var d = 0;
	for (var i = 0; i < Edges.length; i++) {
		var c = Edges[i];

		let x1 = Circles[c.from].pos.x;
		let y1 = Circles[c.from].pos.y;
		let x2 = Circles[c.to].pos.x;
		let y2 = Circles[c.to].pos.y;
		let MiddleX = (x1 + x2) / 2
		let MiddleY = (y1 + y2) / 2



		var d1 = distance(pos, { x: MiddleX, y: MiddleY });
		if (res == -1 || d1 < d) {
			res = i;
			d = d1;
		}
	}
	return { index: res, distance: d };	
}

function CreateMatrix() {
	let res = zeros([Circles.length, Circles.length]);
	for (var c of Edges) {
		res[c.from][c.to] = 1;
		res[c.to][c.from] = 1;
	}
	return res;
}

function CheckConnectivity() {

	let m = CreateMatrix();
	let w = []; 

	let Q = [];
	w[0] = 1;
	Q.push(0);
	let visitedCount = 0;
	while (Q.length > 0) {
		v = Q.shift();
		visitedCount++;
		for (var i = 0; i < Circles.length;i++) 
		{
			if ( m[v][i] == 1 && w[i] != 1 )
			{
				w[i] = 1;
				Q.push(i);
			}
		}
	}
	
	let res = visitedCount == Circles.length;
	document.getElementById("ResConect").textContent = res ? 'Conected' : 'Not Connected';
}

function Animate( startNode )
{
	animation = [];
	overrideColor = [];

	let m = CreateMatrix();
	let w = [];  

	let Q = [];
	w[startNode] = 1;

	Q.push(startNode);
	animation.push( {node: startNode, color: "gray"} );

	while (Q.length > 0) {
		v = Q.shift();
		animation.push( {node: v, color: "black"} );
		for (var i = 0; i < Circles.length;i++) 
		{
			if ( m[v][i] == 1 && w[i] != 1 )
			{
				w[i] = 1;
				Q.push(i);
				animation.push( {node: i, color: "gray"} );
			}
		}
	}

	animationStep();
}

function CreateAnimation(pos){
	var n = getNearestCircle(pos);
	if (n.index >= 0 && n.distance < 30) {
			Animate(n.index);
		}
}

function animationStep()
{
	if ( animation.length > 0 )
	{
		let step = animation.shift();
		overrideColor[step.node] = step.color;
	
		setTimeout(animationStep, AnimSpeed);
	}
}


function init()
{
  window.requestAnimationFrame(draw);
}


init();