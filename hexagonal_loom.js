
function drawHexagon(point_radius, thickness_px) {
    // Create a Paper.js Path to draw a line into it:
    var hexagon = new Path({closed:true,
                            strokeColor: 'black',
                            strokeWidth: thickness_px,
                            strokeJoin: 'round'
    });

    // How many points do we want our object to have
    var points = 6;
    // How large should it be
    // 0 to 2PI is a circle, so divide that by the number of points
    // in our object and that's how many radians we should put a new
    // point in order to draw the shape
    var angle = ((2 * Math.PI) / points);
    
    // For as many vertices in the shape, add a point
    for(i = 0; i < points; i++) {
    
      // Add a new point to the object
      hexagon.add(new Point(
        // Radius * Math.cos(number of radians of the point) is the x position
        point_radius * Math.cos(angle * i), 
        // And the same thing with Math.sin for the y position of the point
        point_radius * Math.sin(angle * i)
      ));
    }
    
    hexagon.translate(center_point);
    hexagon.rotate(-120); // start at upper left corner of hexagon
    // hexagon.selected = true;
    return hexagon
};

function circlesAtIntersections(hexagon, spacing_in, hole_radius){
    // // draw vertical, evenly spaced lines
    // var spacing = hexagon.bounds.width/(hole_count-1);
    // if (spacing < 2.5 * hole_radius) {
    //     console.error('spacing too small')
    // }
    var spacing = spacing_in;
    var hole_count = hexagon.bounds.width/spacing + 1;
    
    var lines = [];
    for (var i=1; i < hole_count - 1; i++) {
        
        var line = new Path.Line(hexagon.bounds.topLeft,
                                 hexagon.bounds.bottomLeft);
        line.position.x += i*spacing;
        lines.push(line);
    }

    var lines_path = new CompoundPath({
        children: lines,
        strokeColor: 'red'
    });
    
    var intersectionGroup = new Group();
    var intersections = lines_path.getIntersections(hexagon);
    
    var circles = [];
    for (var i = 0; i < intersections.length; i++) {
        var intersectionPath = new Path.Circle({
            center: intersections[i].point,
            radius: hole_radius,
            parent: intersectionGroup
        });
        circles.push(intersectionPath);
    }
    var circles_path = new CompoundPath({
        children: circles,
        strokeColor: 'blue'
    });
    
    return new Group([circles_path, lines_path]);
}

// values are given in inches
// need to scale by 96 upon display to save as inches
var point_radius_in = 3,
    thickness_in = .5,
    spacing_in = .2,
    // hole_count  = 21,
    hole_radius_in = .05;
var dpi = 96;

var center_point = new Point(point_radius_in, point_radius_in);
var hexagon = drawHexagon(point_radius_in, thickness_in*dpi);

circlesGroup = circlesAtIntersections(hexagon, spacing_in, hole_radius_in);
circles = circlesGroup.children[0];
lines = circlesGroup.children[1];
lines.remove();
var hexagon_loom_group = new Group([hexagon, circles]);
hexagon_loom_group.scale(dpi); // scale inches to pixels for display
hexagon_loom_group.translate(center_point*dpi);
