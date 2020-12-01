function drawCircle(width_in, thickness_px) {
    var point_radius = width_in/2;
    // Create a Paper.js Path to draw a line into it:
    var hexagon = new Path.Circle({center: new Point(0, 0),
                                   radius: point_radius,
                                   strokeColor: 'black',
                                   strokeWidth: thickness_px
    });
    
    // hexagon.translate(center_point);
    // hexagon.rotate(-120); // start at upper left corner of hexagon
    // hexagon.selected = true;
    return hexagon
};

function circlesAtIntersections(hexagon, spacing_in, hole_radius){
    var spacing = spacing_in;
    var hole_count = Math.round(hexagon.bounds.width/spacing + 1);
    console.log(hole_count + ' hole pairs will be created.')
    
    var lines = [];
    for (var i=0; i < hole_count; i++) {
        
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
};

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
var width_in = 4.8,
    thickness_in = .4,
    spacing_in = .2,
    hole_radius_in = .05;
var dpi = 96;

var center_point = new Point(width_in, width_in);

var hexagon = drawCircle(width_in, thickness_in*dpi);

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
