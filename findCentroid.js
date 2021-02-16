var ps = this;

ps.testCentroid = function(path, test_bounds) {
    var test = new Path.Rectangle(test_bounds);
    var result = path.intersect(test)
    test.remove();

    var remainder = path.area/2 - result.area;
    result.remove();
    // result.strokeColor = 'blue';
    return remainder;
};

ps.calcDimCentroid = function(path, dim) {
    var bounds = path.bounds.clone();
    var min = 0,
        max = bounds[dim],
        test_min_width = 1,
        max_count = 100,
        count = 0;

    test_width = (max - min)/2;
    while ((test_width >= test_min_width) && count < max_count) {
        count ++;
        // console.log('test width: ' + test_width);
        bounds[dim] = min + test_width;
        // console.log('bounds: ' + bounds[dim]);

        var remainder = ps.testCentroid(path, bounds, remove=true);
        // console.log('remainder: ' + remainder)
        if(Math.abs(remainder) <= test_min_width) {
            // right at centroid
            max = 0;
            min = 0;
        } else if (remainder < 0) {
            // past centroid, go back
            max = bounds[dim];
            // console.log('past centroid');
        } else {
            // not past centroid, go farther
            min = bounds[dim];
            // console.log('not past centroid');
        }
        test_width = (max - min) / 2;
    };
    return bounds[dim];
}

ps.calcCentroid = function(path) {
    x = ps.calcDimCentroid(path, 'width');
    y = ps.calcDimCentroid(path, 'height');
    var centroid = new Point(x, y) + path.bounds.topLeft;
    // console.log('centroid: ' + centroid);
    return centroid;
}
