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
		$('select#selectLayer').attr('disabled', 'disabled').change(handleLayerSelect);
	},
	handleLayerSelect = function() {
		var layerName = $(this).val();
		if(layerName !== 'noselect') {
			flashLayerBounds(layerName);
			addLighting(0, 0, 0.5, 0.1, layerName);
		}
		else {

		}
	},
	shadeColor = function(color, percent) {
		// from http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
		var R = parseInt(color.substring(1,3),16);
		var G = parseInt(color.substring(3,5),16);
		var B = parseInt(color.substring(5,7),16);

		R = parseInt(R * (100 + percent) / 100);
		G = parseInt(G * (100 + percent) / 100);
		B = parseInt(B * (100 + percent) / 100);

		R = (R<255)?R:255;  
		G = (G<255)?G:255;  
		B = (B<255)?B:255;  

		var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
		var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
		var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

		return "#"+RR+GG+BB;
	}
	addLighting = function(lightSourceX, lightSourceY, maxLightIntensity, minLightIntensity, layerName) {
		var thisPixelX, thisPixelY, distanceFromLight, baseColour, distanceAsFractionOfMaxDistance, newColour;
		lightSourceX = parseInt(lightSourceX);
		lightSourceY = parseInt(lightSourceY);
		$('.pixel[data-layername=' + layerName + ']').each(function() {
			thisPixelX = parseInt($(this).attr('data-x'));
			thisPixelY = parseInt($(this).attr('data-y'));
			baseColour = $(this).attr('data-baseColour');
			distanceFromLight = Math.sqrt(((thisPixelX - lightSourceX) * (thisPixelX - lightSourceX))+ ((thisPixelY - lightSourceY) * (thisPixelY - lightSourceY)));
			distanceAsFractionOfMaxDistance = (distanceFromLight * distanceFromLight) / (canvasSize * canvasSize);
			newColour = shadeColor(baseColour, (minLightIntensity + ((1 - distanceAsFractionOfMaxDistance) * maxLightIntensity) * 100));
			// Process Edges
			if(thisPixelY > lightSourceY) {
				if(isLayerEdge(thisPixelX, thisPixelY, layerName, Directions.TOP)) {
					newColour = shadeColor(newColour, 5);
				}
				else if(isLayerEdge(thisPixelX, thisPixelY, layerName, Directions.BOTTOM)) {
					newColour = shadeColor(newColour, -5);
				}
			}
			if(thisPixelY < lightSourceY) {
				if(isLayerEdge(thisPixelX, thisPixelY, layerName, Directions.BOTTOM)) {
					newColour = shadeColor(newColour, 5);
				}
				else if(isLayerEdge(thisPixelX, thisPixelY, layerName, Directions.TOP)) {
					newColour = shadeColor(newColour, -5);
				}
			}
			if(thisPixelX > lightSourceX) {
				if(isLayerEdge(thisPixelX, thisPixelY, layerName, Directions.LEFT)) {
					newColour = shadeColor(newColour, 5);
				}
				else if(isLayerEdge(thisPixelX, thisPixelY, layerName, Directions.RIGHT)) {
					newColour = shadeColor(newColour, -5);
				}
			}
			if(thisPixelX < lightSourceX) {
				if(isLayerEdge(thisPixelX, thisPixelY, layerName, Directions.RIGHT)) {
					newColour = shadeColor(newColour, 5);
				}
				else if(isLayerEdge(thisPixelX, thisPixelY, layerName, Directions.LEFT)) {
					newColour = shadeColor(newColour, -5);
				}
			}
			$(this).css('background-color', newColour);
		});
	},
	init = function() {
		canvasSize = 30;
		createPixels(canvasSize);
		sizePixels(canvasSize);
		currentColour = "#789491";
		bindListeners();
		initialiseTools();
	};
	init();
};
