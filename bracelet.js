var dpi = 96,
    width = 1.5*dpi,
    length = 8*dpi,
    rounding = .3*dpi,
    snap_outer = 0.492*dpi,
    snap_inner = 3/16*dpi,
    snap_offset = .8*snap_outer;

var center = length,
    center_point = new Point(center, center);

var cut_color = 'blue', score_color = 'black';

function draw_band() {
    var outline_size = new Size(length+2*snap_offset, width)
    var rectangle = new Rectangle(new Point(0, 0), outline_size);
    var outline = new Path.Rectangle(rectangle, new Size(rounding, rounding));
    outline.strokeColor = cut_color;
    snap_ul_center = new Point(snap_offset, snap_offset);
    draw_snaps(snap_outer/2, width-2*snap_offset, length, 'red');
    draw_snaps(snap_inner/2, width-2*snap_offset, length, cut_color);
}
draw_band()

function draw_snaps(radius, width, length, color) {
    snap = new Path.Circle(snap_ul_center, radius);
    snap.strokeColor = color;
    snap.clone().translate(new Point(length, 0))
    snap.clone().translate(new Point(0, width));
    snap.clone().translate(new Point(length, width));    
}
