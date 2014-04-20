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
	DrawModes = {
		PEN : 0,
		FILL : 1,
		CHOOSE_LIGHT_ORIGIN: 2,
		REVIEW_LIGHTING: 3
	},
	canvasDimensions = 600,
	currentColour,
	currentDrawMode = DrawModes.PEN,
	canvasSize,
	currentLayer = 'default',
	mouseIsDown = false,
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
		if(currentDrawMode === DrawModes.PEN) {
			$(this).css('background-color', currentColour).attr('data-baseColour', currentColour).removeClass('empty');
			$(this).attr('data-layername', currentLayer);
		}
		else if(currentDrawMode === DrawModes.FILL) {
			handleFill($(this).attr('data-x'), $(this).attr('data-y'), $(this).attr('data-baseColour'));
		}
		else if(currentDrawMode === DrawModes.CHOOSE_LIGHT_ORIGIN) {
			handleLightOriginSelection($(this).attr('data-x'), $(this).attr('data-y'));
		}
	},
	handleFill = function(x, y, previousColour) {
		var other;
		x = parseInt(x);
		y = parseInt(y);
		$('.pixel[data-x=' + x + '][data-y=' + y + ']').css('background-color', currentColour).attr('data-baseColour', currentColour).removeClass('empty').attr('data-layername', currentLayer);
		if(x < (canvasSize - 1)) {
			other = $('.pixel[data-x=' + (x + 1) + '][data-y=' + y + ']');
			if($(other).attr('data-baseColour') === previousColour) {
				handleFill(x + 1, y, previousColour);
			}
		}
		if(x > 0) {
			other = $('.pixel[data-x=' + (x - 1) + '][data-y=' + y + ']');
			if($(other).attr('data-baseColour') === previousColour) {
				handleFill(x - 1, y, previousColour);
			}
		}
		if(y < (canvasSize - 1)) {
			other = $('.pixel[data-x=' + x  + '][data-y=' + (y + 1) + ']');
			if($(other).attr('data-baseColour') === previousColour) {
				handleFill(x, y + 1, previousColour);
			}
		}
		if(y > 0) {
			other = $('.pixel[data-x=' + x + '][data-y=' + (y - 1) + ']');
			if($(other).attr('data-baseColour') === previousColour) {
				handleFill(x, y - 1, previousColour);
			}
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
		$('#createNewLayer').click(createNewLayer);
		$('#addLight').click(handleAddLightClick);
		$('#reset').click(handleCancelLight);
		$('input[name=drawMode]').change(handleDrawModeChange);
	},
	handleCancelLight = function() {
		$('.pixel[data-layername="' + currentLayer + '"]').each(function() {
			$(this).css('background-color', $(this).attr('data-baseColour'));
		});
		$('#addLight').html("Add Light to Layer");
		$('input[name=drawMode]:checked').removeAttr('checked');
		$('input[name=drawMode][value=0]').attr('checked', 'checked').change();
	},
	handleAddLightClick = function() {
		if(currentDrawMode === DrawModes.REVIEW_LIGHTING) {
			commitLayerLighting();
		}
		else {
			currentDrawMode = DrawModes.CHOOSE_LIGHT_ORIGIN;
			$(this).html('Select light origin');
			$('#reset,#addLight').attr('disabled', 'disabled');
		}
	},
	commitLayerLighting = function() {
		$('.pixel[data-layername="' + currentLayer + '"]').each(function() {
			$(this).attr('data-baseColour', rgbToHex($(this).css('background-color')));
		});
		$('#addLight').html("Add Light to Layer");
		$('input[name=drawMode]:checked').removeAttr('checked');
		$('input[name=drawMode][value=0]').attr('checked', 'checked').change();
	},
	handleLightOriginSelection = function(x, y) {
		currentDrawMode = DrawModes.REVIEW_LIGHTING;
		$('#reset,#addLight').removeAttr('disabled');
		addLighting(parseInt(x), parseInt(y), parseFloat($('input[name=maxIntensity]').val()), parseFloat($('input[name=minIntensity]').val()), currentLayer);
		$('#addLight').html('Apply Lighting');
	},
	handleDrawModeChange = function() {
		currentDrawMode = parseInt($(this).val());
	},
	createNewLayer = function() {
		var layerName = prompt("Please name the new layer", "LayerX");
		$('#selectLayer option:selected').removeAttr('selected');
		$('#selectLayer').append('<option selected value="' + layerName + '">' + layerName + '</option>').removeAttr('disabled');
		$('#selectLayer').change();
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
		$('#colourPicker').spectrum({
			color: currentColour,
			move: handleColourChange,
			hide: function() {
				$('#colourPicker').spectrum('set', currentColour);
			}
		});
		$('input[name=drawMode][value=0]').attr('checked', 'checked');
	},
	handleColourChange = function(colour) {
		currentColour = colour.toHexString();
	},
	handleLayerSelect = function() {
		currentLayer = $(this).val();
		flashLayerBounds(currentLayer);
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
		$('.pixel[data-layername="' + layerName + '"]').each(function() {
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
	rgbToHex = function(rgb) {
		rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
		function hex(x) {
			return ("0" + parseInt(x).toString(16)).slice(-2);
		}
		return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
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
