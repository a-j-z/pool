var c = document.getElementById("Collisions");
var ctx = c.getContext("2d");
var frame, circles, holes, friction, gravity, canShoot, mouseX, mouseY, mouseDown = false;
var markedForDeletion, shots;
c.style.backgroundColor = "FFFFFF";

function setup()
{
	initialize();
	interval = setInterval(move, 1000.0/60.0);

	document.body.addEventListener("mousemove", function(e) {
		var rect = c.getBoundingClientRect();
		mouseX = e.clientX - rect.left;
		mouseY = e.clientY - rect.top;
	});

	document.body.addEventListener("mousedown", function(e) {
		mouseDown = true;
	});
	document.body.addEventListener("mouseup", function(e) {
		mouseDown = false;
	});
}

function initialize()
{
	canShoot = true;
	frame = 0;
	circles = [];
	holes = [];
	markedForDeletion = [];
	shots = 0;



	holes.push(new Hole(770,30,15));
	holes.push(new Hole(30,30,15));
	holes.push(new Hole(770,370,15));
	holes.push(new Hole(30,370,15));
	holes.push(new Hole(400,30,15));
	holes.push(new Hole(400,370,15));



	circles.push(new Circle(150, 200, 0, 0, 15, 1, true, "rgb(255,255,255)", "", false));

	circles.push(new Circle(600, 200, 0, 0, 15, 1, true, "rgb(255,225,30)", "1", false));
	circles.push(new Circle(630, 217, 0, 0, 15, 1, true, "rgb(255,225,30)", "9", true));
	circles.push(new Circle(630, 183, 0, 0, 15, 1, true, "rgb(50,100,255)", "2", false));
	circles.push(new Circle(660, 200, 0, 0, 15, 1, true, "rgb(50,50,50)", "8", false));
	circles.push(new Circle(660, 166, 0, 0, 15, 1, true, "rgb(255,30,30)", "3", false));
	circles.push(new Circle(660, 234, 0, 0, 15, 1, true, "rgb(50,100,255)", "10", true));
	circles.push(new Circle(690, 183, 0, 0, 15, 1, true, "rgb(75,200,35)", "14", true));
	circles.push(new Circle(690, 217, 0, 0, 15, 1, true, "rgb(180,0,75)", "7", false));
	circles.push(new Circle(690, 149, 0, 0, 15, 1, true, "rgb(150,50,255)", "4", false));
	circles.push(new Circle(690, 251, 0, 0, 15, 1, true, "rgb(255,30,30)", "11", true));
	circles.push(new Circle(720, 200, 0, 0, 15, 1, true, "rgb(180,0,75)", "15", true));
	circles.push(new Circle(720, 234, 0, 0, 15, 1, true, "rgb(255,150,35)", "13", true));
	circles.push(new Circle(720, 166, 0, 0, 15, 1, true, "rgb(75,200,35)", "6", false));
	circles.push(new Circle(720, 268, 0, 0, 15, 1, true, "rgb(255,150,35)", "5", false));
	circles.push(new Circle(720, 132, 0, 0, 15, 1, true, "rgb(150,50,255)", "12", true));

	friction = 0.98;
	gravity = 0.05;
}

function closestPointOnLine(lineX1, lineY1, lineX2, lineY2, pX, pY)
{
	var A1 = lineY2 - lineY1;
	var B1 = lineX1 - lineX2;
	var C1 = (lineY2 - lineY1) * lineX1 +
		(lineX1 - lineX2) * lineY1;
	var C2 = -B1 * pX + A1 * pY;
	var det = A1 * A1 + B1 * B1;
	var cx = 0;
	var cy = 0;
	if (det != 0)
	{
		cx = (A1 * C1 - B1 * C2) / det;
		cy = (A1 * C2 + B1 * C1) / det;
	}
	else
	{
		cx = pX;
		cy = pY;
	}
	return new Point(cx, cy);
}


//STATIC COLLISIONS
function checkStaticCollision(c1, c2)
{
	var isCollide = Math.abs(
		(c1.x - c2.x) * (c1.x - c2.x) + 
		(c1.y - c2.y) * (c1.y - c2.y)
	) < (c1.r + c2.r) * (c1.r + c2.r);

	if (isCollide)
	{
		var midpointX = (c1.x + c2.x) / 2.0;
		var midpointY = (c1.y + c2.y) / 2.0;
		var dist = Math.sqrt(
			(c1.x - c2.x) * (c1.x - c2.x) + 
			(c1.y - c2.y) * (c1.y - c2.y)
		);

		c1.x = midpointX + c1.r * (c1.x - c2.x) / dist;
		c1.y = midpointY + c1.r * (c1.y - c2.y) / dist;
		c2.x = midpointX + c2.r * (c2.x - c1.x) / dist;
		c2.y = midpointY + c2.r * (c2.y - c1.y) / dist;
	}
}


//STATIC-DYNAMIC COLLISIONS
function checkStaticDynamicCollision(c1, c2)
{
	var d = closestPointOnLine(c1.x, c1.y,
		c1.x + c1.velX, c1.y + c1.velY, c2.x, c2.y);
	var closestDistSq = Math.pow(c2.x - d.x, 2) + Math.pow(c2.y - d.y, 2);
	var isCollide = Math.abs(
		(c1.x + c1.velX - c2.x) * (c1.x + c1.velX - c2.x) + 
		(c1.y + c1.velY - c2.y) * (c1.y + c1.velY - c2.y)
	) < (c1.r + c2.r) * (c1.r + c2.r);
	if (closestDistSq <= Math.pow(c1.r + c2.r, 2) && isCollide) 
	{
		var backDist = Math.sqrt(Math.pow(c1.r + c2.r, 2) - closestDistSq);
		var movementVectorLength = Math.sqrt(Math.pow(c1.velX, 2) + Math.pow(c1.velY, 2));
		//point of collision
		var cx = d.x - backDist * (c1.velX / movementVectorLength);
		var cy = d.y - backDist * (c1.velY / movementVectorLength);

		var collisionDist = Math.sqrt(Math.pow(c2.x - cx, 2) + Math.pow(c2.y - cy, 2));
		var nx = (c2.x - cx) / collisionDist;
		var ny = (c2.y - cy) / collisionDist;
		var p = 2 * (c1.velX * nx + c1.velY * ny) / (c1.m + c2.m);
		c1.velX = c1.velX - p * nx * (c1.m + c2.m);
		c1.velY = c1.velY - p * ny * (c1.m + c2.m);
	}
}



//DYNAMIC COLLISIONS
function checkDynamicCollisionRef(c1, c2)
{
	var output = [];
	var d = closestPointOnLine(c1.x, c1.y,
		c1.x + c1.velX, c1.y + c1.velY, c2.x, c2.y);
	var closestDistSq = Math.pow(c2.x - d.x, 2) + Math.pow(c2.y - d.y, 2);
	var isCollide = Math.abs(
		(c1.x + c1.velX - c2.x - c2.velX) * (c1.x + c1.velX - c2.x - c2.velX) + 
		(c1.y + c1.velY - c2.y - c2.velY) * (c1.y + c1.velY - c2.y - c2.velY)
	) < (c1.r + c2.r) * (c1.r + c2.r);
	if (closestDistSq <= Math.pow(c1.r + c2.r, 2) && isCollide) 
	{
		var backDist = Math.sqrt(Math.pow(c1.r + c2.r, 2) - closestDistSq);
		var movementVectorLength = Math.sqrt(Math.pow(c1.velX, 2) + Math.pow(c1.velY, 2));
		var cx, cy;
		//point of collision
		if (movementVectorLength == 0)
		{
			cx = c1.x; cy = c1.y;
		}
		else
		{
			cx = d.x - backDist * (c1.velX / movementVectorLength);
			cy = d.y - backDist * (c1.velY / movementVectorLength);
		}
		output.push(cx);
		output.push(cy);
	}
	return output;
}



function checkDynamicCollision(c1, c2)
{
	var output1 = checkDynamicCollisionRef(c1, c2);
	var output2 = checkDynamicCollisionRef(c2, c1);
	if (output1.length == 2 && output2.length == 2)
	{
		var cx1 = output1[0];
		var cy1 = output1[1];
		var cx2 = output2[0];
		var cy2 = output2[1];
		var d = Math.sqrt(Math.pow(cx1 - cx2, 2) + Math.pow(cy1 - cy2, 2));
		var nx = (cx2 - cx1) / d;
		var ny = (cy2 - cy1) / d;
		var p = 2 * (c1.velX * nx + c1.velY * ny - c2.velX * nx - c2.velY * ny) / (c1.m + c2.m);
		c1.velX = c1.velX - p * c2.m * nx;
		c1.velY = c1.velY - p * c2.m * ny;
		c2.velX = c2.velX + p * c1.m * nx;
		c2.velY = c2.velY + p * c1.m * ny;
	}
}



function checkCircleHoleCollision(c, h)
{
	var dist = Math.pow((c.x - h.x), 2) + Math.pow((c.y - h.y), 2)
	if (dist < Math.pow(h.r * 1.5, 2))
	{
		var changeVelX = (h.x - c.x) * gravity * (1 / Math.pow(dist * 0.01, 2));
		c.velX += changeVelX;

		var changeVelY = (h.y - c.y) * gravity * (1 / Math.pow(dist * 0.01, 2));
		c.velY += changeVelY;
	}
	var speed = Math.pow(c.velX, 2) + Math.pow(c.velY, 2)
	if (dist < Math.pow(h.r * 0.25, 2))
	{
		return true;
	}
	else return false;
}



function updatePosition(c0)
{
	if (c0.isDynamic)
	{
		

		if (c0.x + c0.r + c0.velX > c.width || c0.x - c0.r + c0.velX < 0)
		{
			c0.velX *= -1;
		}
		if (c0.y + c0.r + c0.velY > c.height || c0.y - c0.r + c0.velY < 0)
		{
			c0.velY *= -1;
		}

		c0.velX *= friction;
		if (Math.abs(c0.velX) <= 0.01) c0.velX = 0;
		c0.velY *= friction;
		if (Math.abs(c0.velY) <= 0.01) c0.velY = 0;

		c0.x += c0.velX;
		c0.y += c0.velY;
	}
}

function checkShoot()
{
	for (var i = 0; i < circles.length; i++)
	{
		if (circles[i].velX != 0 || circles[i].velY != 0) return false;
	}
	return true;
}


function drawInstructions()
{
	ctx.textAlign = "center";
	if (checkShoot())
	{
		ctx.fillStyle = "rgb(200,200,200)";
		ctx.font = "30px Arial";
		ctx.fillText("Click to shoot.", 220, 40);
		ctx.font = "15px Arial";
		ctx.fillText("Farther clicks are more powerful.", 220, 60);
	}
	else
	{
		ctx.fillStyle = "rgb(50,50,50)";
		ctx.font = "30px Arial";
		ctx.fillText("Please wait...", 220, 40);
		ctx.font = "15px Arial";
		ctx.fillText("Balls still moving.", 220, 60);
	}
}

function move()
{
	ctx.clearRect(0, 0, c.width, c.height);

	if (mouseDown && checkShoot())
	{
		circles[0].velX = (mouseX - circles[0].x) / 20.0;
		circles[0].velY = (mouseY - circles[0].y) / 20.0;
		shots++;
	}

	for (var i = 1; i < circles.length; i++)
	{
		for (var j = 0; j < i; j++)
		{
			if (!circles[i].isDynamic && !circles[j].isDynamic)
			{
				checkStaticCollision(circles[i], circles[j]);
			}
			else if (!circles[i].isDynamic || !circles[j].isDynamic)
			{
				if (!circles[i].isDynamic)
				{
					checkStaticDynamicCollision(circles[j], circles[i]);
				}
				else
				{
					checkStaticDynamicCollision(circles[i], circles[j]);
				}
			}
			else
			{
				checkDynamicCollision(circles[i], circles[j]);
				checkStaticCollision(circles[i], circles[j]);
			}
		}
	}


	for (var i = 0; i < circles.length; i++)
	{
		for (var j = 0; j < holes.length; j++)
		{
			if (checkCircleHoleCollision(circles[i], holes[j]))
			{
				markedForDeletion.push(i);
			}
		}
		
	}


	drawInstructions();

	ctx.font = "200px Arial";
	ctx.textAlign = "center";
	ctx.fillStyle = "rgb(240,240,240)";
	ctx.fillText("" + shots, 400, 270);

	for (var i = 0; i < holes.length; i++)
	{
		holes[i].draw(ctx);
	}
	for (var i = 0; i < circles.length; i++)
	{
		updatePosition(circles[i]);
		if (!markedForDeletion.includes(i)) circles[i].draw(ctx);
	}
	

	
	if (markedForDeletion.includes(0)) initialize();
	else {
		for (var i = markedForDeletion.length - 1; i > -1; i--)
		{
			circles.splice(markedForDeletion[i],1);
		}
		markedForDeletion = [];
	}


	frame++;
}

setup();