var pixl;
$(function() {
	pixl = new Pixl();
});
Pixl = function() {
	var
	canvasDimensions = 600,
	currentColour,
	mouseIsDown = false;
	createPixels = function(countPerAxis) {
		var canvas = $('#canvas'),
		i, pixel;
		for(i=0; i < (countPerAxis * countPerAxis); i++) {
			pixel = '<div class="empty pixel" x="' + (i % countPerAxis) + '" y=' + Math.floor(i/countPerAxis) + '"></div>';
			canvas.append(pixel);
		}
	},
	sizePixels = function(countPerAxis) {
		var size = canvasDimensions / countPerAxis;
		$('.pixel').addClass("s" + size);
	},
	handlePixelClick = function() {
		$(this).css('background-color', currentColour).removeClass('empty');
	},
	bindListeners = function() {
		$('.pixel').mousedown(handlePixelClick).mouseenter(handleMouseEntry);
		$('#canvas').mousedown(function() { mouseIsDown = true; });
		$('#canvas').mouseup(function() { mouseIsDown = false; });
		$('#canvas').mouseleave(function() { mouseIsDown = false; });
	},
	handleMouseDownStateChange = function(state) {
		mouseIsDown = state;
	},
	handleMouseEntry = function() {
		console.log('entered with mouse down as ' + mouseIsDown);
		if(mouseIsDown) {
			// treat as a drag
			$(this).mousedown();
		}
	},
	init = function() {
		createPixels(10);
		sizePixels(10);
		currentColour = "#789491";
		bindListeners();
	};
	init();
};
