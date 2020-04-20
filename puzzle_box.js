function drawHexagon(point_radius, center_point) {
    // Create a Paper.js Path to draw a line into it:
    var hexagon = new Path({closed:true});
    hexagon.strokeColor = 'black';

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
    //   hexagon.add(new Point(
    //     // Radius * Math.cos(number of radians of the point) is the x position
    //     point_radius * Math.cos(angle * i), 
    //     // And the same thing with Math.sin for the y position of the point
    //     point_radius * Math.sin(angle * i)
    //   ));
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

function drawHexagon_side(side_radius, center_point) {
    point_radius = side_radius * Math.cos(Math.PI/6);
    return drawHexagon(point_radius, center_point)
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

function drawCutShape(center_point, radius) {
    var cutshape = new Path({closed:true, strokeColor:'black'});
    cutshape.add(new Point(0,0));
    cutshape.add(pointByAngle(Math.PI*2/3, radius));
    cutshape.add(pointByAngle(Math.PI, radius));
    cutshape.add(pointByAngle(-Math.PI*2/3, radius));
    cutshape.translate(center_point);
    return cutshape
};

var center_point = new Point(300, 300)
var inner_radius = 150,
    width = 25,
    mid_radius = inner_radius + 2 * width,
    outer_radius = mid_radius + 4 * width,
    round_radius = 15;
    
var cut_color = 'blue', score_color = 'black';

function drawTop() {
    outer = drawHexagon_side(outer_radius, center_point);
    mid = drawHexagon_side(mid_radius, center_point);
    cut_shape = drawCutShape(center_point, outer_radius);
    
    tmp = outer.subtract(mid);
    arc = tmp.subtract(cut_shape);
    tmp.remove();
    
    // arc.strokeColor = 'blue';
    arc = roundPath(arc, round_radius);
    
    outer = roundPath(outer, round_radius);
    outer.strokeColor = cut_color;

    // remove overlap
    var intersections = arc.getIntersections(outer);
    
    // want to sort by x ascending
    // then y ascending
    // intersections seems to sort by x property
    function compare(a, b) {
        if (a.point.x == b.point.x) {
            return a.point.y - b.point.y
        }
        else {
            return a.point.x - b.point.x;    
        }
    }
    intersections = intersections.sort(compare);
    arc = arc.splitAt(intersections[0]);
    arc_inner = arc.splitAt(intersections[1]);
    arc_inner.stroke_color = score_color;

    // clean up and prep for printing
    arc.remove();
    mid.remove();
    cut_shape.remove();
}
drawTop();

function drawMid() {
    // need to remove double cut lines
    outer = drawHexagon_side(outer_radius, center_point);
    mid = drawHexagon_side(mid_radius, center_point);
    cut_shape = drawCutShape(center_point, outer_radius);
    
    // create female shape
    tmp = outer.subtract(mid);
    arc = tmp.subtract(cut_shape);
    tmp.remove();
    
    arc.strokeColor = 'blue';
    // arc.fillColor = 'blue';
    arc = roundPath(arc, round_radius);

    // create male shape
    var cut_radius = mid_radius + (outer_radius - mid_radius)/2;
    cut = drawHexagon_side(cut_radius, center_point);
    tmp = cut_shape.unite(cut);
    cut.remove();
    tmp2 = tmp.intersect(outer);
    tmp.remove();
    tmp2 = roundPath(tmp2, 15);
    fill_shape = tmp2.subtract(arc);
    tmp2.remove();
    
    // remove overlap
    var intersectionGroup = new Group();
    var intersections = fill_shape.getIntersections(arc);
    intersectionGroup.removeChildren();

    // intersections = [intersections[0], intersections[intersections.length-1]];

    var split_points = [fill_shape.getNearestLocation(intersections[0].point).point,
        fill_shape.getNearestLocation(intersections[intersections.length-1].point).point];
    console.log(fill_shape.isClosed()); 
    console.log(fill_shape.length);
    // console.log(fill_shape.firstSegment);
    // console.log(fill_shape.lastSegment);
    fill_shape2 = fill_shape.splitAt(split_points[0]);
    console.log(fill_shape2.isClosed());
    console.log(fill_shape2.length);

    fill_shape3 = fill_shape2.splitAt(split_points[1]);
    console.log(fill_shape3.length);
    // fill_shape3.firstSegment.selected = true;
    fill_shape3.strokeColor = 'red';
    
    console.log('hi')
    // intersections = fill_shape.getIntersections(arc);
    // for (var i = 0; i < intersections.length; i++) {
    //     var intersectionPath = new Path.Circle({
    //         center: intersections[i].point,
    //         radius: 5,
    //         fillColor: 'red',
    //         parent: intersectionGroup
    //     });
    // }
    
    // console.log(intersections[intersections.length-1].point);
    // fill_shape = fill_shape.splitAt(intersections[intersections.length-1].point);
    // fill_shape.firstSegment.selected = true;
    // var F = new Path.Circle({center: fill_shape.firstSegment.point,
    //     radius: 15,
    //     fillColor: 'blue'
    // })
    // var L = new Path.Circle({center: fill_shape.lastSegment.point,
    //     radius: 15,
    //     fillColor: 'black'
    // })
    // fill_shape.remove();
    // fs2.remove();
    

    // clean up
    mid.remove();
    outer.remove();
    cut_shape.remove();
}
// drawMid();
