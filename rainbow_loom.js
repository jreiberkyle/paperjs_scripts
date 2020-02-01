/**
 * create a rainbow loom shape and circle intersection lines
 * @param  {float} height External height of loom shape
 * @param  {float} width Distance between center lines in loom outline
 * @param {float} thickness Thickness of loom outline
 * @param {float} spacing Spacing between intersection lines along loom
 *                        centerline
 * @return {Path.Group} [loom centerline, loom outline, intersecting lines]
 */
function drawRainbow(height, width, thickness = 1, spacing = 1) {
    
    var center = new Point(0, 0);
    var new_height = height - width/2 - thickness/2;
    var arc_radius = new_height/2,
        leg_height = new_height/2;
    
    var from = center - new Point(arc_radius, 0),
        through = center - new Point(0, arc_radius),
        to = center + new Point(arc_radius, 0);
    var rainbow = new Path.Arc(from, through, to);

    
    // lines
    var orig_line = new Path.Line(center, from - new Point(width, 0));
    orig_line.pivot = center;
    var lines = [orig_line];
    
    // radial lines
    var rad_seg_count = Math.floor(rainbow.length/(2*spacing));
    var del_angle = 90/rad_seg_count;
    console.log('del angle: ' + del_angle);
    for (var i=1; i < rad_seg_count; i++) {
        var line = orig_line.clone().rotate(i*del_angle);
        lines.push(line);
    }

    console.log(lines.length + ' lines');
    
    // leg lines
    var seg_count = Math.floor((leg_height-thickness/2)/(spacing));
    console.log(seg_count + ' leg segs');
    for (var i=1; i <= seg_count; i++) {
        var line = orig_line.clone().translate(new Point(0, i*spacing));
        lines.push(line);
    }    
    
    var lines_path = new CompoundPath({
        children: lines,
    });
    
    // add mirrored lines
    lines_path.pivot = center;
    var lines2 = lines_path.clone().scale(-1, 1);
    lines_path.addChildren(lines2.children);

    // add center line
    lines.push(orig_line.clone().rotate(90));
    
    // rainbow width
    var thick_x = new Point(width/2, 0);
    var thick_y = thick_x.clone().rotate(90);
    var rainbow_in = new Path.Arc(from + thick_x,
                                  through  + thick_y,
                                  to - thick_x);
    var rainbow_out = new Path.Arc(from - thick_x,
                                   through  - thick_y,
                                   to + thick_x);
    function addLegs(arc) {
        var from = arc.segments[0].clone().point,
            to = arc.segments[arc.segments.length-1].point,
            delta = new Point(0, leg_height);
        arc.insert(0, from + delta);
        arc.add(to + delta);
        return arc
    }

    addLegs(rainbow);
    addLegs(rainbow_in);
    addLegs(rainbow_out);
    rainbow_in.insert(0, rainbow_out.segments[0]);
    rainbow_in.add(rainbow_out.segments[rainbow_out.segments.length-1]);
    rainbow_in.join(rainbow_out);
    rainbow_in.strokeWidth = thickness * 96;
    
    return new Group([rainbow, rainbow_in, lines_path]);
};

/**
 * draw circles at intersections between two paths
 * @param  {Path} path1 First path for intersection
 * @param  {Path} path2 Second path for intersection
 * @param {float} hole_radius_px Circle hole radius in pixels
 * @return {NaN}
 */
function circlesAtIntersections(path1, path2, hole_radius_px){
    
    var intersectionGroup = new Group();
    var intersections = path1.getIntersections(path2);

    for (var i = 0; i < intersections.length; i++) {
        var intersectionPath = new Path.Circle({
            center: intersections[i].point,
            radius: hole_radius_px,
            strokeColor: 'blue',
            parent: intersectionGroup
        });
    }
}

// values are given in inches
// need to scale by 96 upon display to save as inches
var size_in = 10,
    width_in = 2.5,
    thickness_in = .6,
    spacing_in = 1/2,
    hole_radius_in = .05;
var dpi = 96;

var center_point = new Point(size_in, size_in)/2;
var rainbowGroup = drawRainbow(size_in, width_in, thickness_in, spacing_in);
rainbowGroup.scale(dpi); // scale inches to pixels for display
rainbowGroup.translate(center_point*dpi);

var rainbow_center = rainbowGroup.children[0],
    rainbow_outline = rainbowGroup.children[1],
    lines = rainbowGroup.children[2];
lines.strokeColor = 'red';
lines.remove();
rainbow_center.strokeColor = 'black';
rainbow_outline.strokeColor = 'green';
circlesAtIntersections(rainbow_outline, lines, hole_radius_in*dpi);
