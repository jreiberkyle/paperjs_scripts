// this script is intended for use in paperjs sketch
function drawHexagon(width_in) {
    var point_radius = width_in/2;
    // Create a Paper.js Path to draw a line into it:
    var hexagon = new Path({closed:true,
                            strokeColor: 'black',
                            strokeWidth: 3,
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
    
    // hexagon.segments[0].selected = false;
    hexagon.translate(center_point);
    hexagon.rotate(-90); // start at upper left corner of hexagon
    // hexagon.selected = true;
    return hexagon
};

// https://stackoverflow.com/a/25939038
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

    
// values are given in inches
// need to scale by 96 upon display to save as inches
var width_in = 2,
    thickness_in = .05,
    spacing_in = .2,
    hole_radius_in = .05;
var dpi = 96;

var center_point = new Point(width_in, width_in)/2;


// var hexagon = roundPath(drawHexagon(width_in, thickness_in*dpi), .05);
// var hexagon = drawHexagon(width_in);
// // hexagon.rotate(30);
// hexagon.scale(dpi); // scale inches to pixels for display
// hexagon.selected = true;
// hexagon.visible = false;

function hexagonTileCenter(col, row, original, space=0) {
    var width = original.bounds.width + space,
        height = 3 / 4 * original.bounds.height + space;
    var x_off = (1-row % 2) * width/2; //original.bounds.width/2;
    return new Point(
        width * col + x_off,
        // original.bounds.width * col + x_off,
        height * row);    
};

function drawHexagonTile(col, row, original, space=0) {
    var tile = original.clone();
    tile.translate(hexagonTileCenter(col, row, original, space));
    return tile;
};

function drawDot(location, color, radius) {
        var dot = new Path.Circle({
        center: location,
        radius: radius,
        fillColor: color
    });
    return dot;
}

// var HexagonTile = Base.extend({
//     initialize: function(col, row, original) {
//         enumerable: true,    // makes additional methods visible
//         this.path = drawHexagonTile(col, row, hexagon);
//         this.col = col;
//         this.row = row;
//     }
// });

function drawText(val, point, {color='blue', size=50}) {
    var text = new paper.PointText({
        position: point + new Point(0, size/3),
        content: val,
        fontFamily: 'Helvetica',
        fontWeight: 'bold',
        fontSize: size,
        fillColor: color,
        justification: 'center'
    });
    return text;
};

// drawText(, new Point(100, 100))
var HexagonTiles = Base.extend({
	initialize: function({cols=0, rows=0, limit=0, space=0}) {
	    console.log('init');
	    console.log(space);
	    this.hexagon = drawHexagon(width_in).scale(dpi);

	    if ((cols == 0 && rows == 0) ||
	        (cols == 0 && limit == 0) ||
	        (rows == 0 && limit == 0)) {
	            return;
	    } else if (cols == 0 ) {
	        cols = Math.trunc(limit / rows);
	        cols += limit % rows;
	    } else if (rows == 0) {
	        rows = Math.trunc(limit / cols);
	        rows += limit % cols;
	    }
	    tiles = [];
        for (var i=0; i<rows; i++) {
	        for(var j=0; j<cols; j++){
                if (limit > 0) {
                    var count = i*cols + j;
                    if (count >= limit) {
                        break;
                    }
                }
                tiles.push(drawHexagonTile(j, i, this.hexagon, space));
                // tiles.push(new HexagonTile(j, i));
            }
        };
        this.hexagon.remove();
        this.tiles = tiles;
        this.rows = rows;
        this.cols = cols;
        this.count = this.tiles.length;
	},
	loc: function(i) {
	    row = Math.trunc(i / this.cols);
	    col = i - row*this.cols;
	    return [col, row];
	},
	tile: function(col, row) {
	    return this.tiles[this.cols*row + col];
	},
	setTile: function(col, row, path) {
	    this.tiles[this.cols*row + col] = path;
	},
	toCompound: function() {
	    for (var i = 0; i < this.tiles.length; i++) {
	        this.tiles[i] = new CompoundPath({children: [this.tiles[i]]});
	    }
	},
	apply: function(callback) {
	    for (var i = 0; i < this.tiles.length; i++) {
	        callback(this.tiles[i]);
	    }	    
	},
	translate: function(point) {
	    for (var i = 0; i < this.tiles.length; i++) {
	        this.tiles[i].translate(point);
	    }
	},
	neighborLocs: function(col, row, forward=false) {
	    var neighbors = [];
	    var rowMinus = 1 - 1*forward;
	    var minRow = Math.max(0, row-rowMinus),
	        maxRow = Math.min(this.rows-1, row+1),
	        colPlus = 0,
	        colMinus = 0,
	        maxCol,
	        minCol;
	    for (var j = minRow; j <= maxRow; j++) {
	        if (j == row) {
	            colPlus = 1;
	            colMinus = 1 - 1*forward;
	        } else {
	            colPlus = j % 2;
	            colMinus = (j+1) % 2;
	        }
	        maxCol = Math.min(this.cols-1, col+colPlus);
	        minCol = Math.max(0, col-colMinus);
	        var count;
	        for (var i = minCol; i <= maxCol; i++) {
	            count = j*this.cols + i;
	           // console.log('count: ' + count);
	            if (count >= this.count) {
                    continue;
                }
	            if (!(i == col && j == row)) {
	                neighbors.push([i, j]);
	            }
	        }
	        
	    }
	    return neighbors;
	},
	neighborTiles: function(col, row, forward=false) {
	    tiles = [];
	    neighbor_locs = this.neighborLocs(col, row, forward);
	    for (var i = 0; i < neighbor_locs.length; i++) {
	        var tile = this.tile(neighbor_locs[i][0], neighbor_locs[i][1]);
	        if (tile) {
	            tiles.push(tile);
	        }
	    }
	    return tiles;
	},
	removeOverlaps: function() {
	    for (var i = 0; i < this.tiles.length; i++) {
	        var loc = this.loc(i);
	        removeNeighborOverlaps(loc[0], loc[1], draw=false);
	    }
	}
});

alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
            'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
var ht = new HexagonTiles({cols: 7, limit: alphabet.length, space: 7});
// alphabet = ['A', 'B', 'C', 'D', 'E'];
// var ht = new HexagonTiles({cols: 2, limit: alphabet.length, space: 7});

ht.translate(100, 100);
ht.apply(p => roundPath(p, 9));
// ht.apply(p => drawDot(p.bounds.center, 'red', 5));

text = []
for (var i=0; i<ht.count; i++) {
    drawText(alphabet[i], ht.tiles[i].position, {size: 120});
    // text.push(drawText(ht.loc(i), ht.tiles[i].position,
    //                   {color: 'green', size: 50}));
}

function viewNeighbors(col, row) {
    var tile = ht.tile(col, row)
    tile.selected = true;
    paper.view.center = tile.position;
    
    neighbor_tiles = ht.neighborTiles(col, row, true);
    for (var i = 0; i < neighbor_tiles.length; i++) {
        neighbor_tiles[i].strokeColor = 'red'; // selected = true;
    }
}
// viewNeighbors(4, 1);

allColors = ['green', 'blue', 'purple', 'black', 'yellow', 'orange', 'red'];
function removeOverlapping(path, otherPath) {
    // pretty specific to hexagons but works for now
    var intersections = path.getIntersections(otherPath);
    if (path.closed) {
        // sort lowest index to highest
        intersections.sort(function(a, b){return a.index - b.index}); 
    } else {
        // sort highest index to lowest
        intersections.sort(function(a, b){return b.index - a.index});
    }
    // 
    console.log('intersections: ' + intersections);
    var colors = ['blue', 'red', 'green'];
    // path.curves[intersections[1].index].remove();
    
    
    var paths = [];
    for (var i = 0; i < intersections.length; i++) {
        // var int = intersections[i];
        var subpath = path.splitAt(intersections[i]);
        console.log('path: ' + path.length);
        console.log('subpath: ' + subpath.length);
        subpath.strokeColor = colors[i];
        paths.push(subpath);
    }
    // for now we remove the shortest path. hacky. probably better to check a
    // point in the middle of the curve
    // paths.sort(function(a, b){return a.length - b.length});
    console.log(paths.length);

    for (var i = 0; i < paths.length; i++) {
        paths[i].strokeColor = allColors.pop(); // colors[i];
        var intersectionPath = new Path.Circle({
            center: intersections[i].point,
            radius: 4,
            fillColor: 'red'
        });
    }
    if (paths.length) {
        console.log('path0: ' + paths[0].length);
        console.log('path1: ' + paths[1].length);
        // paths[0].remove();
    }
    remainder = paths[1];
    return remainder;

}
// removeOverlapping(ht.tile(1, 1), ht.tile(2,1));
// ht.tile(2,1).visible = false;

function removeNeighborOverlaps(col, row, draw=false) {
    var tile = ht.tile(col, row);
    tile.selected = true;
    paper.view.center = tile.position;

    neighbors = ht.neighborLocs(col, row, true);
    // if (!neighbors.length) {
    //     var newPath = new CompoundPath({
    //     children: [tile], strokeColor: 'red', strokeWidth: 5, visible:true});
    //     ht.setTile(col, row, newPath);
    //     return;
    // }

    children = [];
    for (var i = 0; i < neighbors.length; i++) {
        children.push(ht.tile(neighbors[i][0], neighbors[i][1]));
    }
    // console.log(children.length);
    n_path = new CompoundPath({children: children});
    n_path.selected = true;
    
    if (!tile.intersects(n_path)) {
        console.log('does not intersect neighbors');
        var newPath = new CompoundPath({
        children: [tile], strokeColor: 'red', strokeWidth: 5, visible:true});
        ht.setTile(col, row, newPath);
        return;
    }
    // lets open up the path to avoid resetting index later
    // from here on out, splitAt keeps the part before the split
    // as the original path and returns the part after the split
    // as a new path
    tile.splitAt(tile.firstSegment.point); 
    // drawDot(tile.firstSegment.point, 'blue', 7);
    var intersections = tile.getIntersections(n_path);

    pieces = [];
    colors = ['green', 'blue', 'purple', 'black', 'yellow', 'orange', 'grey'];
    intersections.reverse();

    for (var i = 0; i < intersections.length; i++) {
        var intersection = intersections[i];
        // console.log('time: ' + intersection.time);
        if (intersection.time > 0) {
            // console.log('skipping');
            continue;
        }
        if (draw) {
            drawDot(intersection.point, colors[i] , 5);
            // console.log('i: ' + i);
            // console.log('intersection: ' + intersection);
            // console.log('color: ' + colors[i]);
        }
        var subpath = tile.splitAt(intersection);
        subpath.strokeColor = colors[i];
        // console.log('path: ' + tile.length);
        // console.log('subpath: ' + subpath.length);
        pieces.push(subpath);
    }
    if (tile.firstSegment.point != intersections[0].point) {
        // console.log('letstry');
        pieces[0].join(tile);    
    }
    
    // only save the non-overlapping segments
    children = [];
    for (var i = 0; i < pieces.length; i++) {
        if (1-i%2) {
            // console.log('child color: ' + colors[i]);
            children.push(pieces[i]);
        } else {
            pieces[i].remove();
        }
    }
    var newPath = new CompoundPath({
        children: children, strokeColor: 'red', strokeWidth: 5, visible:true});
    // console.log('newPath: ' + newPath.length);
    // drawDot(tile.firstSegment.point, 'red', 5);
    ht.setTile(col, row, newPath);
}
ht.removeOverlaps();

// function drawTile(letter) {
//     var hexagon = roundPath(drawHexagon(width_in, thickness_in*dpi), .05);
//     hexagon.rotate(30);
//     hexagon.scale(dpi); // scale inches to pixels for display
//     hexagon.translate(center_point*dpi);

//     var text = new paper.PointText(center_point*dpi);
//     text.translate(new Point(0, 45));
//     text.content=letter;
//     text.justification = 'center';
//     text.style = {
//         fontFamily: 'Helvetica',
//         fontWeight: 'bold',
//         fontSize: '120px',
//         fillColor: 'blue',
//         justification: 'center'
//     };
//     return new Group([hexagon, text]);
// };

//a = drawTile('A');
//b = drawTile('B');
//b.translate(new Point(.9*width_in*dpi, 0));
//console.log('here');
