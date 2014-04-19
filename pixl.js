var pixl;
$(function() {
	pixl = new Pixl();
});
Pixl = function() {
	var
	Directions = {
		TOP : 0,
		RIGHT : 1,
		BOTTOM : 3,
		LEFT : 4
	},
	canvasDimensions = 600,
	currentColour,
	canvasSize,
	layerRecording = false,
	mouseIsDown = false,
	defaultLayerName = 'newLayer',
	createPixels = function(countPerAxis) {
		var canvas = $('#canvas'),
		i, pixel;
		for(i=0; i < (countPerAxis * countPerAxis); i++) {
			pixel = '<div class="empty pixel" data-x="' + (i % countPerAxis) + '" data-y="' + Math.floor(i/countPerAxis) + '"></div>';
			canvas.append(pixel);
		}
	},
	sizePixels = function(countPerAxis) {
		var size = canvasDimensions / countPerAxis;
		$('.pixel').addClass("s" + size);
	},
	handlePixelClick = function() {
		$(this).css('background-color', currentColour).attr('data-baseColour', currentColour).removeClass('empty');
		if(layerRecording) {
			$(this).attr('data-layername', defaultLayerName);
		}
	},
	isLayerEdge = function(x, y, layerName, direction) {
		x = parseInt(x);
		y = parseInt(y);
		console.log.apply(console, arguments);
		// Assumes specified pixel is in the layer
		if(direction === Directions.TOP) {
			return y === 0 || $('.pixel[data-x=' + x + '][data-y=' + (y - 1) + ']').attr('data-layername') !== layerName;
		}
		else if(direction === Directions.BOTTOM) {
			return y === (canvasSize - 1) || $('.pixel[data-x=' + x + '][data-y=' + (y + 1) + ']').attr('data-layername') !== layerName;
		}
		else if(direction === Directions.RIGHT) {
			return x === (canvasSize - 1) || $('.pixel[data-x=' + (x + 1) + '][data-y=' + y + ']').attr('data-layername') !== layerName;
		}
		else if(direction === Directions.LEFT) {
			return x === 0 || $('.pixel[data-x=' + (x - 1) + '][data-y=' + y + ']').attr('data-layername') !== layerName;
		}
		return false;
	},
	bindListeners = function() {
		$('.pixel').mousedown(handlePixelClick).mouseenter(handleMouseEntry);
		$('#canvas').mousedown(function() { mouseIsDown = true; });
		$('#canvas').mouseup(function() { mouseIsDown = false; });
		$('#canvas').mouseleave(function() { mouseIsDown = false; });
		$('#recordNewLayer').click(toggleRecording);
	},
	toggleRecording = function() {
		if(layerRecording) {
			var layerName = prompt("Please name the new layer", "LayerX");
			$(this).html('start recording a new layer');
			$('.pixel[data-layername=' + defaultLayerName + ']').attr('data-layername', layerName);
			$('#selectLayer').append('<option value="' + layerName + '">' + layerName + '</option>').removeAttr('disabled');
			flashLayerBounds(layerName);
		}
		else {
			$(this).html('stop recording');
		}
		layerRecording = !layerRecording;
	},
	handleMouseDownStateChange = function(state) {
		mouseIsDown = state;
	},
	handleMouseEntry = function(e) {
		if(mouseIsDown) {
			// treat as a drag
			$(this).mousedown();
			pauseEvent(e || window.event);
		}
	},
	pauseEvent = function (e){
		if(e.stopPropagation) e.stopPropagation();
		if(e.preventDefault) e.preventDefault();
		e.cancelBubble=true;
		e.returnValue=false;
		return false;
	},
	flashLayerBounds = function(layername) {
		var thisPixel;
		$('.pixel[data-layername=' + layername + ']').each(function() {
			thisPixel = $(this);
			if(isLayerEdge(thisPixel.attr('data-x'), thisPixel.attr('data-y'), layername, Directions.TOP)) {
				thisPixel.addClass('topEdge');
			}
			if(isLayerEdge(thisPixel.attr('data-x'), thisPixel.attr('data-y'), layername, Directions.BOTTOM)) {
				thisPixel.addClass('bottomEdge');
			}
			if(isLayerEdge(thisPixel.attr('data-x'), thisPixel.attr('data-y'), layername, Directions.LEFT)) {
				thisPixel.addClass('leftEdge');
			}
			if(isLayerEdge(thisPixel.attr('data-x'), thisPixel.attr('data-y'), layername, Directions.RIGHT)) {
				thisPixel.addClass('rightEdge');
			}
		});
		setTimeout(function() { $('.topEdge,.bottomEdge,.leftEdge,.rightEdge').removeClass('topEdge bottomEdge leftEdge rightEdge'); }, 1000);
	},
	initialiseTools = function() {
		$('select#selectLayer').attr('disabled', 'disabled');
	},
	init = function() {
		canvasSize = 10;
		createPixels(canvasSize);
		sizePixels(canvasSize);
		currentColour = "#789491";
		bindListeners();
		initialiseTools();
	};
	init();
};
