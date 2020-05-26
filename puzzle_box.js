var dpi = 96,
    width = 1/8*dpi,
    mid_radius = 3.5*dpi/2,
    inner_radius = mid_radius - width
    outer_radius = mid_radius + width,
    outer_radius_point = getPointRadius(outer_radius),
    round_radius = 1/32*dpi,
    gap_width = 1/4*dpi,
    notch_width = outer_radius_point - outer_radius,
    circle_radius = inner_radius,
    layer_thickness = .118*dpi
    tab_thickness = .245*dpi,
    tab_width = 1/8*1/3*dpi,
    tab_kerf = .005*dpi;

var center = outer_radius*1.5,
    center_point = new Point(center, center);

var cut_color = 'blue', score_color = 'black';

drawAll();

function drawAll() {
    var dX = 2.2*outer_radius_point,
        dY = outer_radius;
    drawTop().translate(new Point(dX, dY));
    drawMiddle();
    drawBottom().translate(new Point(-dX, dY));
    drawTabs();
}

function drawTabHoles() {
    var tabs = new Group();
    var thickness = tab_thickness;
    var tab = new Path.Rectangle(
        {
            point: [-thickness/2, -tab_width/2],
            size: [thickness, tab_width],
            strokeColor:'red',
            parent: tabs
        });
    tab.translate(new Point(0, -(mid_radius+(outer_radius-mid_radius)/2)));
    tab.pivot = new Point(0, 0);
    
    tab.clone().rotate(60);
    tab.clone().rotate(120);
    tab.clone().rotate(180);

    tabs.translate(center_point);
    return tabs;
}

function drawTabs() {
    var tabs = new Group();
    var thickness = 3*layer_thickness,
        width = tab_width + tab_kerf;
    var tab = new Path.Rectangle(
        {
            point: [-thickness/2, -width/2],
            size: [thickness, width],
            strokeColor:'red',
            parent: tabs
        });
    tab.rotate(90);
    // tab.translate(new Point(2.5*tab.bounds.width, 0))

    tab.clone().translate(new Point(-2*tab.bounds.width, 0));
    tab.clone().translate(new Point(-4*tab.bounds.width, 0));
    tab.clone().translate(new Point(2*tab.bounds.width, 0));
    tabs.translate(center_point);

    // tabs.translate(region.bounds.center);
    // region.remove();
    return tabs;
}

function drawTop() {
    var outer = drawHexagon_side(outer_radius, center_point),
        mid = drawHexagon_side(mid_radius, center_point),
        cut_shape = drawDiamond(center_point, 2*outer_radius);
    var group = new Group();    
    drawCircles(center_point, circle_radius, width).parent = group;
    drawTabHoles().parent = group;
    // drawTabs().parent = group;
    
    arc = drawArc(outer, mid, cut_shape);
    mid.remove();
    cut_shape.remove();
    
    arc = roundPath(arc, round_radius);
    arc.strokeColor = score_color;
    arc.parent = group;
    
    // notch
    var notch = drawNotchCut(center_point - new Point(outer_radius_point, 0),
             2*notch_width);
    var outer2 = outer.subtract(notch);
    outer.remove()
    outer = roundPath(outer2, round_radius);
    outer.strokeColor = cut_color;
    outer.parent = group;
    notch.remove();
    
    // // remove overlap
    // var filter_fcn = function (intersections) {
    //     // sort by point.y
    //     var i = intersections.sort((a,b) => a.point.y - b.point.y);
    //     // first point is highest intersection
    //     // second point is lowest intersection
    //     return [{start: i[0], stop: i[i.length-1]}];
    //     // return [i[0], i[i.length-1]];
    // };
    // arc_inner = removeOverlap(arc, outer, filter_fcn, false, false);
    // arc_inner.stroke_color = score_color;

    return group;
}

function drawMiddle() {
    var outer = drawHexagon_side(outer_radius, center_point),
        mid = drawHexagon_side(mid_radius, center_point),
        inner = drawHexagon_side(inner_radius, center_point),
        cut_shape = drawDiamond(center_point, 2*outer_radius);
    
    var group = new Group;
    drawTabHoles().parent = group;
    
    // outer arc
    arc = drawArc(outer, mid, cut_shape);
    arc = roundPath(arc, round_radius);
    arc.strokeColor = cut_color;
    arc.parent = group;
    
    // create male shape
    var cut_radius = mid_radius + (outer_radius - mid_radius)/2;
    cut = drawHexagon_side(cut_radius, center_point);
    tmp = cut_shape.unite(cut);
    cut.remove();
    tmp2 = tmp.intersect(outer);
    tmp.remove();
    tmp2 = roundPath(tmp2, round_radius);
    fill_shape = tmp2.subtract(arc);
    fill_shape.strokeColor = cut_color;
    fill_shape.parent = group
    tmp2.remove();
    
    // inner arc
    cut_shape2 = cut_shape.clone().translate(new Point(gap_width, 0));
    female_arc = drawArc(outer, inner, cut_shape2);
    cut_shape2.remove();
    female_arc = roundPath(female_arc, round_radius);
    female_arc.strokeColor = score_color;
    female_arc.parent = group;

    // // outline
    // outer = roundPath(outer, round_radius);
    // outer.strokeColor = 'red'; //cut_color;
    outer.remove();
    
    drawCircles(center_point, circle_radius, width).parent = group;
    
    // clean up
    inner.remove();
    mid.remove();
    cut_shape.remove();
    return group;
}
// drawMiddle();

function drawBottom() {
    // need to remove double cut lines
    var outer = drawHexagon_side(outer_radius, center_point),
        inner = drawHexagon_side(inner_radius, center_point),
        cut_shape = drawDiamond(center_point, 2*outer_radius);
    
    var group = new Group;
    drawTabHoles().parent = group;
    // drawTabs().parent = group;
    
    // create female shape
    cut_shape2 = cut_shape.clone().translate(new Point(gap_width, 0));
    female_arc = drawArc(outer, inner, cut_shape2);
    cut_shape2.remove();
    female_arc = roundPath(female_arc, round_radius);
    female_arc.strokeColor = cut_color;
    female_arc.parent = group

    male_arc = drawArc(outer, inner, cut_shape);
    male_arc = roundPath(male_arc, round_radius);
    // male_arc_pieces = male_arc.subtract(female_arc);
    // male_arc.remove()
    var filter_fcn = function (intersections) {
        var i = intersections.sort();
        return [i[0], i[1]];
    };
    // removeOverlap(female_arc, male_arc, filter_fcn, true, true)

    // create male shape
    var cut_radius = inner_radius + (outer_radius - inner_radius)/2;
    cut = drawHexagon_side(cut_radius, center_point);
    tmp = cut_shape.unite(cut);
    cut.remove();
    tmp2 = tmp.intersect(outer);
    tmp.remove();
    tmp2 = roundPath(tmp2, round_radius);
    fill_shape = tmp2.subtract(male_arc);
    fill_shape.strokeColor = cut_color;
    tmp2.remove();
    male_arc.remove();

    var notch = drawNotchCut(center_point - new Point(outer_radius_point, 0),
             2*notch_width);
    var tmp = fill_shape.subtract(notch);
    fill_shape.remove()
    fill_shape = roundPath(tmp, round_radius);
    fill_shape.parent= group;
    // outer.strokeColor = cut_color;
    notch.remove();
    
    // clean up
    inner.remove();
    outer.remove();
    cut_shape.remove();
    
    return group;
}
// drawBottom();

function drawHexagon(point_radius, center_point) {
    // Create a Paper.js Path to draw a line into it:
    var hexagon = new Path({closed:true});
    hexagon.strokeColor = 'red';

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
      hexagon.add(pointByAngle(angle * i, point_radius));
    }
    
    hexagon.translate(center_point);
    return hexagon
};

function pointByAngle(angle, radius) {
    return new Point(
        // Radius * Math.cos(number of radians of the point) is the x position
        radius * Math.cos(angle), 
        // And the same thing with Math.sin for the y position of the point
        radius * Math.sin(angle)
      )
}

function getPointRadius(side_radius) {
    return side_radius / Math.cos(Math.PI/6);
}
function drawHexagon_side(side_radius, center_point) {
    return drawHexagon(getPointRadius(side_radius), center_point)
};

function roundPath(path,radius) {
	var segments = path.segments.slice(0);
	path.segments = [];
	for(var i = 0, l = segments.length; i < l; i++) {
		var curPoint = segments[i].point;
		var nextPoint = segments[i + 1 == l ? 0 : i + 1].point;
		var prevPoint = segments[i - 1 < 0 ? segments.length - 1 : i - 1].point;
		var nextDelta = curPoint - nextPoint;
		var prevDelta = curPoint - prevPoint;
		nextDelta.length = radius;
		prevDelta.length = radius;
		path.add({
            point:curPoint - prevDelta,
            handleOut: prevDelta/2
		});
		path.add({
            point:curPoint - nextDelta,
            handleIn: nextDelta/2
		});
	}
	path.closed = true;
	return path;
};

function drawDiamond(center_point, radius) {
    var cutshape = new Path({closed:true, strokeColor:'red'});
    cutshape.add(new Point(0,0));
    cutshape.add(pointByAngle(Math.PI*2/3, radius));
    cutshape.add(pointByAngle(Math.PI, radius));
    cutshape.add(pointByAngle(-Math.PI*2/3, radius));
    cutshape.translate(center_point);
    return cutshape
};

function drawNotchCut(center_point, width) {
    var cutshape = new Path.Rectangle(
        {
            point: [-width/2, -width],
            size: [width, 2*width],
            strokeColor:'red'
        });
    cutshape.translate(center_point);
    return cutshape;
}

function drawCircles(center_point, outer_radius, width) {
    var circle1 = new Path.Circle(center_point, outer_radius);
    var circle2 = new Path.Circle(center_point, outer_radius-width);
    circle1.strokeColor = 'teal';
    circle2.strokeColor = 'orange';
    return new Group([circle1, circle2]);
}


function drawArc(outer, inner, cut) {
    tmp = outer.subtract(inner);
    arc = tmp.subtract(cut);
    tmp.remove();
    return arc;
}

function removeOverlap(path, other_path, filter_fcn,
                       show_intersections=true, show_split_points=true) {
    var overlap = other_path.subtract(path);
    // overlap.fillColor = 'red';
    var intersections = path.getIntersections(overlap);
    // var intersections = path.getIntersections(other_path);

    if (show_intersections) {
        for (var i = 0; i < intersections.length; i++) {
            var intersectionPath = new Path.Circle({
                center: intersections[i].point,
                radius: 2*i+2,
                fillColor: 'red'
            });
        }
    }

    var i_sets = filter_fcn(intersections);
    var non_overlap;
    for (var i = 0; i < i_sets.length; i++) {
        var start = i_sets[i]['start'].point,
            stop = i_sets[i]['stop'].point;
        if(show_split_points) {
            var first = new Path.Circle({
                center: start,
                radius: 4,
                fillColor: 'black'
            });
            var second = new Path.Circle({
                center: stop,
                radius: 4,
                fillColor: 'blue'
            });
        }
        split_path = path.splitAt(start);
        split_path.fillColor = 'blue'
        non_overlap = split_path.splitAt(stop);
        non_overlap.fillColor = 'red'
        split_path.remove();
    }
    
    overlap.remove();
    return non_overlap;
}
