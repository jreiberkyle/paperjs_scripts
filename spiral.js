var path = new Path({strokeColor: 'blue'});
var position = new Point(200, 200);
console.log(view.center);

function drawSpiral(centerPoint, turns, 
                    innerRadius,
                    divergence) {
    // center point is `position`
    // outer point is `position` + (0, 1)
    var spiral = new Path();
    spiral.strokeColor = 'black'
    
    // set center point and start spiral
    // spiral.add(centerPoint);
    spiral.pivot = centerPoint;
    
    dAngle = 1;
    end = 360*turns/dAngle;
    start = Math.floor(innerRadius * end);
    console.log(start);

    for (i=start; i<=end; i++) {
        var ratio = 1;
        var vector = new Point({
            angle: i * dAngle,
            length: i / ratio
        });
        spiral.add(centerPoint + vector);
    }
    
    // scale the spiral so the outer radius is 1
    spiral.scale(1/end);

    // TODO: support divergence
    // if divergence is 0, circle
    // if it is 1, no divergence
    // if it is less than 1, inner part is wider than outer
    // if it is greater than 1, outer part is wider
    spiral.smooth();
    spiral.selected = 'true' ;
    return spiral;
}

var scale = 150;
var innerRadius = 0.95;
spiral = drawSpiral(position, 1, innerRadius, 1);
spiral.scale(scale);
