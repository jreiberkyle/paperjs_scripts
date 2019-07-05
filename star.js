var length = 200;
var num_points = 7;
var convexity = 0.5

var angle = 360/(2 * num_points);
console.log(angle);

// calculate center point of star
var angle_rad = Math.PI * angle / 180;
var center_dist = 0.5 * Math.tan(angle_rad/2);
console.log(center_dist);
const line = new Path();
line.pivot = new Point(0.5, center_dist);

// create star edge
// the middle point determines how convex the shape is
line.add(new Point(0,0), new Point(0.5,convexity * center_dist), new Point(1, 0));
line.smooth({type: 'continuous'});

// create first line of star
line.scale(length);
line.position = new Point(length, length);
line.strokeColor = 'black';


// create the rest of the lines that draw the star
function new_line(line, angle) {
    var line2 = line.clone();
    line2.rotate(180-angle);
    return line2;
}

var lines = [];
lines.push(line)
for (var i = 1; i < num_points; i++) { 
  var newLine = new_line(lines[i-1], angle); 
  lines.push(newLine);
}

// join lines to make one shape
for (var i = 1; i < lines.length; i++) {
    lines[0].join(lines[i]);
}
line.strokeColor = 'blue';

// draw circle at points of the star
var center_y = length  / (2 * Math.cos(angle_rad / 2));
const circle = new Path.Circle(line.pivot, center_y);
circle.strokeColor = 'blue';
