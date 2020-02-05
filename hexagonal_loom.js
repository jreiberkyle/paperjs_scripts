
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


function drawComb(height, count, spacing_in, hole_radius, recess_height=.25){
    var spacing = spacing_in;
    
    var teeth = [], recesses = [];
    var recess_width = spacing - 2*hole_radius;
    for (var i=0; i < count; i++) {
        var x = i*spacing;
        var tooth = new Path.Circle(new Point(x, 0), hole_radius)
        teeth.push(tooth);
        
        if (i < (count-1)) {
            // draw recess
            var size = new Size(recess_width, -recess_height);
            console.log(size)
            var recess = new Path.Rectangle(tooth.bounds.rightCenter,size)
            recesses.push(recess);            
        }
    }
    var teeth_path = new CompoundPath({
        children: teeth,
        // strokeColor: 'red'
    });
    var recesses_path = new CompoundPath({
        children: recesses,
        // strokeColor: 'red'
    });
    
    var bottom_left = teeth_path.bounds.leftCenter;
    var top_right = teeth_path.bounds.rightCenter - new Point(0, height)
    var comb_orig = new Path.Rectangle(bottom_left, top_right);
    var comb = comb_orig.unite(teeth_path).subtract(recesses_path);
    comb_orig.remove();
    teeth_path.remove();
    recesses_path.remove();
    comb.strokeColor = 'blue'
    return comb;
}

// values are given in inches
// need to scale by 96 upon display to save as inches
var point_radius_in = 2.5,
    thickness_in = .5,
    spacing_in = .2,
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

var comb_group = drawComb(1, 10, spacing_in, hole_radius_in)
comb_group.scale(dpi); // scale inches to pixels for display
comb_group.translate(center_point*dpi);
