var pixl;
$(function() {
	pixl = new Pixl();
});
Pixl = function() {
	var
	canvasDimensions = 600,
	currentColour,
	layerRecording = false,
	mouseIsDown = false,
	defaultLayerName = 'newLayer',
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
		$(this).css('background-color', currentColour).attr('data-baseColour', currentColour).removeClass('empty');
		if(layerRecording) {
			$(this).attr('data-layername', defaultLayerName);
		}
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
	initialiseTools = function() {
		$('select#selectLayer').attr('disabled', 'disabled');
	},
	init = function() {
		createPixels(10);
		sizePixels(10);
		currentColour = "#789491";
		bindListeners();
		initialiseTools();
	};
	init();
};
