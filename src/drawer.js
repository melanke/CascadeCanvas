/***** DRAWER *****/

//depends on typeChecker, event, objectTools, resource, color
//is dependency of loop

(function(){

    CC.screens = [];
    CC.tiles = {};
    CC.step = 0; //each loop increments the step, it is used for animation proposes

	CC.draw = function(){

        for (var i in CC.screens) {
            var scr = CC.screens[i];

    	    scr.context.clearRect(0, 0 , scr.w, scr.h);

            CC.areaSearch({
                x: scr.x,
                y: scr.y,
                w: scr.w,
                h: scr.h,
                includeFixedOnScreen: scr.htmlId

            }).sort(["zIndex", "DESC"], ["getCreationOrder", "ASC"]).each(function(){

    	        drawElement(this, scr);

    	    });

        }

        CC.step++;
	};

    CC.loadScreens = function() {

        if (!CC.screens || !CC.screens.length) {

            var canvas = document.getElementById('CascadeCanvas');

            if (canvas  && canvas.getContext) {

                var s = {
                    htmlId: "CascadeCanvas",
                    context: canvas.getContext("2d"),
                    x: 0,
                    y: 0,
                    w: canvas.offsetWidth,
                    h: canvas.offsetHeight,
                    setCenter: setCenter
                };

                mouseEnvironmentBuilder(canvas, s);

                CC.screens = [s];
            }

        } else {

            for (var i in CC.screens) {
                var s = CC.screens[i];

                if (!s.htmlId) {
                    CC.screens.splice(i, 1);
                    continue;
                }

                var canvas = document.getElementById(s.htmlId);

                if (!canvas || !canvas.getContext) {
                    CC.screens.splice(i, 1);
                    continue;
                }

                mouseEnvironmentBuilder(canvas, s);

                if (!s.context) {

                    s.context = canvas.getContext('2d');
                }

                if (s.x === undefined) {
                    s.x = 0;
                }

                if (s.y === undefined) {
                    s.y = 0;
                }

                if (s.w === undefined) {
                    s.w = canvas.offsetWidth;
                }

                if (s.h === undefined) {
                    s.h = canvas.offsetHeight;
                }

                if (!s.setCenter) {
                    s.setCenter = setCenter;
                }

            };

        }

    };

    var setCenter = function(x, y) {
        var fx = x - (this.w / 2);
        var fy = y - (this.h / 2);

        if (CC.isNumber(this.maxX)) {
            fx = Math.min(fx, this.maxX);
        }

        if (CC.isNumber(this.maxY)) {
            fy = Math.min(fy, this.maxY);
        }

        if (CC.isNumber(this.minX)) {
            fx = Math.max(fx, this.minX);
        }

        if (CC.isNumber(this.minY)) {
            fy = Math.max(fy, this.minY);
        }

        this.x = fx;
        this.y = fy;
    };

	var drawElement = function(el, scr) {

		if (el.hidden === true) {
            return;
        }

        var layers = CC.sort(el.layers, ["zIndex", "DESC"]);

        for (var s in layers) {
            var layr = layers[s];
            if (CC.isFunction(layr)) {
                layr.call(el, scr);
            } else {
                drawLayer(el, layr, scr);
            }
        }

	};

/**
zIndex (number) default: 0
hidden (bool) default: false
shape ('rect', 'circle', 'text', number[]) default: 'rect'
text (string) default: null
font
	size (number) default: 10
	baseline ('alphabetic', 'top', 'hanging', 'middle', 'ideographic', 'bottom') default: 'top'
	style ('normal', 'italic', 'oblique') default: 'normal'
	weight ('normal', 'bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '700', '800', '900') default: normal
	family (string) default: 'sans-serif'
offsetX (number) default: 0
offsetY (number) default: 0
w (number) default: element w
h (number) default: element h,
blendMode (source-over, source-in, source-out, source-atop, destination-over, destination-in, destination-out, destination-atop, lighter, copy, xor, multiply, screen, overlay, darken, lighten, color-dodge, color-burn, hard-light, soft-light, difference, exclusion, hue, saturation, color, luminosity) default: null
angle (number) default: 0
anchor
	x (number) default: center of the element
	y (number) default: center of the element
flip ('', 'x', 'y', 'xy') default: ''
scale
	x (number) default: 1
	y (number) default: 1
alpha (number) default: 1
shadow
	blur (number) default: 0
	color (color) default: 'black'
	x (number) default: 0
	y (number) default: 0
fill
	color (color) default: 'black'
	linearGradient
		start (number[]) default: [0, 0]
		end (number[]) default: [100, 0]
		--map<int, color>
	radialGradient
		innerCircle
			centerX (number) default: 50
			centerY (number) default: 50
			radius (number) default: 0
		outerCircle
			centerX (number) default: 50
			centerY (number) default: 50
			radius (number) default: 100
		--map<int, color>
roundedBorderRadius (number) default: 0
stroke
	color (color) default: 'black'
	linearGradient
		start (number[]) default: [0, 0]
		end (number[]) default: [100, 0]
		--map<int, color>
	radialGradient
		innerCircle
			centerX (number) default: 50
			centerY (number) default: 50
			radius (number) default: 0
		outerCircle
			centerX (number) default: 50
			centerY (number) default: 50
			radius (number) default: 100
		--map<int, color>
	thickness (number) default: 1
	cap ('butt', 'round', 'square') default: 'butt'
	join ('round','bevel', 'miter') default: 'miter'
	dash (number, number[]) default: null
sprite
	url (string) default: null
	x (number) default: 0
	y (number) default: 0
	w (number) default: lower value between the layer w and file w
	h (number) default: lower value between the layer h and file h
	delay (number) default: 1
	frames (number) default: 1
	vertical (bool) default: false
	repeat ('', 'x', 'y', 'xy') default: ''
tileSize
	w (number) default: 16
	h (humber) default: 16	
tiles (string[][]) OBS.: The string is the name of the tile
*/

	var drawLayer = function(el, layr, scr) {

		/** PRE VERIFICATIONS AND INICIALIZATION BEFORE DRAW **/

		//if the layer is hidden we dont need to draw it
		if (!layr || layr.hidden === true) {
            return;
        }

        var config = configDrawing(el, layr, scr);

        //save context to be able to restore to this state
        scr.context.save();

        //if the element is not fixed on this screen
        if (el.fixedOnScreen !== true && el.fixedOnScreen !== scr.htmlId) {
            //draw the layer relative to screen x and y (to offset the camera position)
            scr.context.translate(-scr.x, -scr.y);
        }

        //translate the canvas to the x, y of the element to draw it from 0, 0
        scr.context.translate(el.x, el.y);

        /** OK, NOW LETS DO THIS! **/
        setElementRotation(el, config, scr);
        setLayerRotation(el, layr, config, scr);
        setLayerOffset(config, scr);
        setElementFlip(el, config, scr);
        setLayerFlip(layr, config, scr);
        setLayerScale(layr, config, scr);
        setLayerAlpha(layr, scr);
        setLayerBlendMode(layr, scr);

        setLayerShadow(layr, scr);

        setLayerFill(layr, config, scr);
        setLayerStroke(layr, config, scr);
        setLayerSpriteOrTile(layr, config, scr);

        if (layr.shadow) {
            //if we did draw the shadow, we need to clean it and draw the main content on top of it
            clearShadow(scr);

            setLayerFill(layr, config, scr);
            setLayerStroke(layr, config, scr);
            setLayerSpriteOrTile(layr, config, scr);
        }

        scr.context.restore();

	};

	var configDrawing = function(el, layr, scr){

		//drawing configuration
        var config = {};

        //defining a Width and Height of the element
        config.EW = el.w,
        config.EH = el.h;

        //if it is a text, config the font
        if (scr && layr.shape === "text" && CC.isString(layr.text)) {
            config.font = createFont(layr, scr);
        }

        //if we dont know W and H we discover it
        if (!el.w || !el.h) {

            //W will be the farest point at right, H will be the farest point at bottom
            if (CC.isArray(layr.shape)) {

                config.EW = el.w || 0;
                config.EH = el.h || 0;
                for (var i in layr.shape) {
                    config.EW = Math.max(config.EW, layr.shape[i][0]);
                    config.EH = Math.max(config.EH, layr.shape[i][1]);
                }

            } else if (layr.shape === "text" && CC.isString(layr.text)) {

                var measuredW = 50;

                if (scr) {
                    scr.context.font = config.font;
                    measuredW = scr.context.measureText(layr.text).width;
                }

                config.EH = el.h || layr.font.size * 1.5;
                config.EW = el.w || measuredW;
            }

        }

        config.offsetX = layr.offsetX || 0,
        config.offsetY = layr.offsetY || 0,
        config.FW = layr.w || config.EW, //final W
        config.FH = layr.h || config.EH; //final H

        if (layr.shape === "circle") {
            config.FH = config.FW;
        }

        return config;

	};

	var setElementRotation = function(el, config, scr) {
		//element rotation
		if (el.angle) {

            //element anchor point - default will be the center of element
            if (!el.anchor) {
                el.anchor = {
                    x: config.EW / 2,
                    y: config.EH / 2
                };
            }

            //translate to the anchor point
            scr.context.translate(el.anchor.x, el.anchor.y);
            //rotate
            scr.context.rotate(el.angle * Math.PI/-180);
            //get back to previous 0, 0
            scr.context.translate(-el.anchor.x, -el.anchor.y);
        }
	};

	var setLayerRotation = function(el, layr, config, scr) {
		//'layer' rotation
        if (layr.angle) {

            //'layer' anchor point - default will be the center of element
            if (!layr.anchor) {
                layr.anchor = el.anchor || {
                    x: config.EW / 2,
                    y: config.EH / 2
                };
            }

            //translate to the anchor point
            scr.context.translate(layr.anchor.x, layr.anchor.y);
            //rotate
            scr.context.rotate(layr.angle * Math.PI/-180);
            //get back to previous 0, 0
            scr.context.translate(-layr.anchor.x, -layr.anchor.y);
        }
	};

	var setLayerOffset = function(config, scr) {
		//translate to the chosen offset
        scr.context.translate(
            config.offsetX, 
            config.offsetY
        );
	};

	var setElementFlip = function(el, config, scr) {
		//flipping the element
        if (el.flip && el.flip.length) {
            var scaleHor = el.flip.indexOf("x") != -1 ? -1 : 1;
            var scaleVer = el.flip.indexOf("y") != -1 ? -1 : 1;

            //translate to the center
            scr.context.translate(config.FW/2, config.FH/2);
            //scale
            scr.context.scale(scaleHor, scaleVer);
            //translate back to 0, 0
            scr.context.translate(-config.FW/2, -config.FH/2);
        }
	};

	var setLayerFlip = function(layr, config, scr) {
		//flipping the layer
        if (layr.flip && layr.flip.length) {
            var scaleHor = layr.flip.indexOf("x") != -1 ? -1 : 1;
            var scaleVer = layr.flip.indexOf("y") != -1 ? -1 : 1;

            //translate to the center
            scr.context.translate(config.FW/2, config.FH/2);
            //scale
            scr.context.scale(scaleHor, scaleVer);
            //translate back to 0, 0
            scr.context.translate(-config.FW/2, -config.FH/2);
        }
	};

	var setLayerScale = function(layr, config, scr) {
		//scale - if want to stretch or squeeze the layer
        if (layr.scale && (CC.isNumber(layr.scale.x) || CC.isNumber(layr.scale.y))) {

            //translate to the center
            scr.context.translate(config.FW/2, config.FH/2);
            //scale
            scr.context.scale(
                CC.isNumber(layr.scale.x) ? layr.scale.x : 1, 
                CC.isNumber(layr.scale.y) ? layr.scale.y : 1);
            //translate back to 0, 0
            scr.context.translate(-config.FW/2, -config.FH/2);
        }
	};

	var setLayerAlpha = function(layr, scr) {
		//alpha - semi transparent options
		if (layr.alpha != undefined && layr.alpha < 1) {
            scr.context.globalAlpha = layr.alpha;
        } else {
            scr.context.globalAlpha = 1;
        }
	};

    var setLayerBlendMode = function(layr, scr) {
        if (layr.blendMode) {
            scr.context.globalCompositeOperation = layr.blendMode;
        } else {
            scr.context.globalCompositeOperation = null;
        }
    }

    var setLayerShadow = function(layr, scr) {

        if (!layr.shadow) {
            return;
        }

        if (layr.shadow.blur) {
            scr.context.shadowBlur = layr.shadow.blur;
        }

        if (layr.shadow.color) {
            scr.context.shadowColor = layr.shadow.color;
        }

        if (layr.shadow.x) {
            scr.context.shadowOffsetX = layr.shadow.x;
        }

        if (layr.shadow.y) {
            scr.context.shadowOffsetY = layr.shadow.y;
        }

    };

    var clearShadow = function(scr) {
        scr.context.shadowColor = 0;
        scr.context.shadowOffsetX = 0; 
        scr.context.shadowOffsetY = 0;
        scr.context.shadowBlur = 0;
    };

	var setLayerFill = function(layr, config, scr) {
		
		if (!layr.fill || (
            !layr.fill.color && 
            !layr.fill.linearGradient && 
            !layr.fill.radialGradient)) {
			return;
		} 

		setLayerFillStyle(layr, config, scr);

        //draw a rectangle
        if (layr.shape === "rect" || layr.shape === undefined) {

            if (!layr.roundedBorderRadius) {
                scr.context.fillRect(0, 0, config.FW, config.FH);
            } else {
                createRoundedBorder(config.FW, config.FH, layr.roundedBorderRadius, scr);
                scr.context.fill();
            }

        //draw a circle
        } else if (layr.shape === "circle") {

            createCircle(config, scr);
            scr.context.fill();

        //draw a text
        } else if (layr.shape === "text" && CC.isString(layr.text) && layr.text.length) {

            scr.context.font = config.font;
            scr.context.textBaseline = layr.font.baseline;
            drawText(layr, config, scr, function(line, x, y) { scr.context.fillText(line, x, y); });

        //draw a polygon
        } else if (CC.isArray(layr.shape)) {

            createPolygon(layr, scr);
            scr.context.fill();

        }
	};

	var setLayerStroke = function(layr, config, scr) {
		//stroke
        if (!layr.stroke || (
            !layr.stroke.color && 
            !layr.stroke.linearGradient && 
            !layr.stroke.radialGradient && 
            layr.stroke.thickness === undefined && 
            !layr.stroke.cap && 
            !layr.stroke.join && 
            !layr.stroke.dash)) {
        	return;
        }

        setLayerStrokeStyle(layr, config, scr);

        //draw a rectangle
        if (layr.shape === "rect" || layr.shape === undefined) {

            if (!layr.roundedBorderRadius) {
                scr.context.strokeRect(0, 0, config.FW, config.FH);
            } else {
                createRoundedBorder(config.FW, config.FH, layr.roundedBorderRadius, scr);
                scr.context.stroke();
            }

        //draw a circle
        } else if (layr.shape === "circle") {

            createCircle(config, scr);

            scr.context.stroke();

        //draw a text
        } else if (layr.shape === "text" && CC.isString(layr.text) && layr.text.length) {

            scr.context.font = config.font;
            scr.context.textBaseline = layr.font.baseline;
            drawText(layr, config, scr, function(line, x, y) { scr.context.strokeText(line, x, y); });

        //draw a polygon
        } else if (CC.isArray(layr.shape)) {

            createPolygon(layr, scr);
            scr.context.stroke();

        }
        
	};

    var setLayerSpriteOrTile = function(layr, config, scr) {
        //sprite
        if (layr.sprite && layr.sprite.url) {

            setLayerSprite(layr, config, scr);            

        } else if (layr.tiles) {

            setLayerTiles(layr, config, scr);
        }
    };

    /****************************************************************************************/
    /**********      ********************************************************      **********/
    /******   *******   **************************************************   ******   *******/
    /***   *************   ********************************************   ************   ****/
    /**   ***************   ******************************************   **************   ***/
    /****************************************************************************************/
    /******************************  ***********************  *******************************/
    /*******************   *******************************************   ********************/
    /********************   *****************************************   *********************/
    /***********************                                         ************************/
    /****************************************************************************************/
    /****************************************************************************************/
    /* @melanke - 13/11/2013 ****************************************************************/


	var setLayerFillStyle = function(layr, config, scr) {
		//by color
        if (layr.fill.color && CC.isString(layr.fill.color)) {

            scr.context.fillStyle = layr.fill.color;

        //by linear gradient
        } else if (layr.fill.linearGradient) {

            scr.context.fillStyle = createLinearGradient(
                layr.fill.linearGradient, config.FW, config.FH, scr);
        
        //by radial gradient    
        } else if (layr.fill.radialGradient) {

            scr.context.fillStyle = createRadialGradient(
                layr.fill.radialGradient, config.FW, config.FH, scr);

        }

	};

	var setLayerStrokeStyle = function(layr, config, scr) {
		//by color
        if (layr.stroke.color && CC.isString(layr.stroke.color)) {

            scr.context.strokeStyle = layr.stroke.color;

        //by linearGradient
        } else if (layr.stroke.linearGradient) {

            scr.context.strokeStyle = createLinearGradient(
                layr.stroke.linearGradient, config.FW, config.FH, scr);
            
        //by radial gradient 
        } else if (layr.stroke.radialGradient) {

            scr.context.strokeStyle = createRadialGradient(
                layr.stroke.radialGradient, config.FW, config.FH, scr);

        }

        //stroke thickness
        if (layr.stroke.thickness) { 
            scr.context.lineWidth = layr.stroke.thickness;
        }

        //stroke end style - 'butt','round' OR 'square'
        if (layr.stroke.cap) { 
            scr.context.lineCap = layr.stroke.cap;
        }

        //stroke curve style - 'round','bevel' OR 'miter'
        if (layr.stroke.join) { 
            scr.context.lineJoin = layr.stroke.join;
        }

        //line dashes
        if (layr.stroke.dash) {
            var arr;

            if (CC.isArray(layr.stroke.dash)) {
                arr = layr.stroke.dash;
            } else {
                arr  = [layr.stroke.dash];
            }

            if (scr.context.setLineDash !== undefined) {
                scr.context.setLineDash(arr);
            } else if (scr.context.mozDash !== undefined) {
                scr.context.mozDash = arr;
            }
        }
	};

    var setLayerSprite = function(layr, config, scr){

        limitSprite(layr, config, scr);
        var sprite = createSprite(layr.sprite, config.FW, config.FH);

        if (!sprite.w || !sprite.h) {
        	return;
        }

        var startX = 0;
        var startY = 0;
        var repeatX = layr.sprite.repeat && layr.sprite.repeat.indexOf("x") != -1;
        var repeatY = layr.sprite.repeat && layr.sprite.repeat.indexOf("y") != -1;

        //repeat like a pattern if repeatX or repeatY is true
        do {
            startY = 0;
            do {

                scr.context.drawImage(
                    sprite.res, 
                    sprite.x, 
                    sprite.y, 
                    sprite.w, 
                    sprite.h, 
                    startX, 
                    startY, 
                    sprite.w, 
                    sprite.h);
                
                if (repeatY) {
                    startY += sprite.h;
                }
            } while (startY < config.EH && repeatY);

            if (repeatX) {
                startX += sprite.w;
            }

        } while (startX < config.EW && repeatX);
    };

    var setLayerTiles = function(layr, config, scr) {
        
        limitSprite(layr, config, scr);

        var tileSize = layr.tileSize || {};
            
        var tw = tileSize.w || 16;
        var th = tileSize.h || 16;
        

        var startY = 0;

        for (var y in layr.tiles) {

            var startX = 0;

            for (var x in layr.tiles[y]) {
                var tile = CC.tiles[layr.tiles[y][x]];
                tile.w = tw;
                tile.h = th;

                var sprite = createSprite(tile, config.FW, config.FH);

		        if (sprite.w && sprite.h) {

	                scr.context.drawImage(
	                    sprite.res, 
	                    sprite.x, 
	                    sprite.y, 
	                    sprite.w, 
	                    sprite.h, 
	                    startX, 
	                    startY, 
	                    sprite.w, 
	                    sprite.h);
	            }

                startX += tw;
            }
            startY += th;
        }
    };

	var createCircle = function(config, scr) {
		scr.context.beginPath();

        scr.context.arc(
            config.FW / 2, 
            config.FW / 2, 
            config.FW / 2,
            0, 2 * Math.PI);

        scr.context.closePath();
	};

	var createPolygon = function(layr, scr) {

        if (!CC.isArray(layr.shape[0]) 
            || !CC.isNumber(layr.shape[0][0]) 
            || !CC.isNumber(layr.shape[0][1])) {
            return;
        }

		scr.context.beginPath();
        scr.context.moveTo(layr.shape[0][0], layr.shape[0][1]);

        for (var p in layr.shape) {
            var point = layr.shape[p];
            scr.context.lineTo(point[0], point[1]);
        }
        
        scr.context.closePath();
	};

    var createLinearGradient = function(linearGradient, FW, FH, scr){

        if (!linearGradient.start) {
            linearGradient.start = [0, 0];
        }

        if (!linearGradient.end) {
            linearGradient.end = [100, 0];
        }

        var x1 = linearGradient.start[0] / 100 * FW;
        var y1 = linearGradient.start[1] / 100 * FH;
        var x2 = linearGradient.end[0] / 100 * FW;
        var y2 = linearGradient.end[1] / 100 * FH;

        var gradient = scr.context.createLinearGradient(x1, y1, x2, y2);

        for (var s in linearGradient) {
            var stop = parseFloat(s);
            if (CC.isNumber(stop)) {
                gradient.addColorStop(stop, linearGradient[s]);
            }
        }

        return gradient;

    };

    var createRadialGradient = function(radialGradient, FW, FH, scr){

        if (!radialGradient.innerCircle) {
            radialGradient.innerCircle = {};
        }

        if (radialGradient.innerCircle.centerX === undefined) {
            radialGradient.innerCircle.centerX = 50;
        }

        if (radialGradient.innerCircle.centerY === undefined) {
            radialGradient.innerCircle.centerY = 50;
        }        

        if (radialGradient.innerCircle.radius === undefined) {
            radialGradient.innerCircle.radius = 0;
        }

        if (!radialGradient.outerCircle) {
            radialGradient.outerCircle = {};
        }

        if (radialGradient.outerCircle.centerX === undefined) {
            radialGradient.outerCircle.centerX = 50;
        }

        if (radialGradient.outerCircle.centerY === undefined) {
            radialGradient.outerCircle.centerY = 50;
        }        

        if (radialGradient.outerCircle.radius === undefined) {
            radialGradient.outerCircle.radius = 100;
        }

        var maxDim = Math.max(FW, FH);

        var x1 = radialGradient.innerCircle.centerX / 100 * FW;
        var y1 = radialGradient.innerCircle.centerY / 100 * FH;
        var r1 = radialGradient.innerCircle.radius / 100 * maxDim;
        var x2 = radialGradient.outerCircle.centerX / 100 * FW;
        var y2 = radialGradient.outerCircle.centerY / 100 * FH;
        var r2 = radialGradient.outerCircle.radius / 100 * maxDim;

        var gradient = scr.context.createRadialGradient(x1, y1, r1, x2, y2, r2);

        for (var s in radialGradient) {
            var stop = parseFloat(s);
            if (!isNaN(stop) && isFinite(stop)) {
                gradient.addColorStop(stop, radialGradient[s]);
            }
        }

        return gradient;

    };

    var createFont = function(layr, scr) {
        if (!layr.font) {
            layr.font = {};
        }

        var b = " ";
        var px = "px";
        layr.font.style = layr.font.style || "";
        layr.font.weight = layr.font.weight || "";
        layr.font.size = layr.font.size || 10;
        layr.font.family = layr.font.family || "sans-serif";
        layr.font.baseline = layr.font.baseline || "top";
        return layr.font.style + b + layr.font.weight + b + layr.font.size + px + b + layr.font.family;
    };

    var createRoundedBorder = function(FW, FH, radius, scr){
        scr.context.beginPath();
        scr.context.moveTo(radius, 0);
        scr.context.arcTo(FW, 0, FW, FH, radius);
        scr.context.arcTo(FW, FH, 0, FH, radius);
        scr.context.arcTo(0, FH, 0, 0, radius);
        scr.context.arcTo(0, 0, FW, 0, radius);
        scr.context.closePath();
    };

    var limitSprite = function(layr, config, scr){
        //limit the sprite with a rectangle
        if (layr.shape === "rect" || layr.shape === undefined) {

            if (!layr.roundedBorderRadius) {
                scr.context.beginPath();
                scr.context.moveTo(0, 0);
                scr.context.lineTo(config.FW, 0);
                scr.context.lineTo(config.FW, config.FH);
                scr.context.lineTo(0, config.FH);
                scr.context.closePath();
            } else {
                createRoundedBorder(config.FW, config.FH, layr.roundedBorderRadius, scr);
            }

            scr.context.clip();

        //limit the sprite with a circle
        } else if (layr.shape === "circle") {

            createCircle(config, scr);
            scr.context.clip();

        //draw a text
        } else if (layr.shape === "text" && CC.isString(layr.text) && layr.text.length) {

            scr.context.font = config.font;
            scr.context.textBaseline = layr.font.baseline;

            var pathText = scr.context.pathText ||
                scr.context.webkitPathText      ||
                scr.context.mozPathText         ||
                scr.context.oPathText           ||
                scr.context.msPathText          ||
                null;

            if (pathText !== null) {
            	drawText(layr, config, scr, function(line, x, y) { pathText(line, x, y); });
                scr.context.clip();
            }

        //limit the sprite with a polygon
        } else if (CC.isArray(layr.shape)) {

            createPolygon(layr, scr);
            scr.context.clip();

        }
    };

    var createSprite = function(sprite, FW, FH){

        //build the sprite config
        var response = {
            res: CC.useResource(sprite.url),
            x: sprite.x || 0,
            y: sprite.y || 0,
        };

        if (response.res) {

	        response.w = sprite.w || Math.min(FW, response.res.width);
	        response.h = sprite.h || Math.min(FH, response.res.height);

	        var delay = sprite.delay || 1;

	        if (sprite.frames && sprite.frames > 1) {
	            if (sprite.vertical) {
	                response.y += (parseInt(CC.step / delay) % sprite.frames) * response.h;
	            } else {
	                response.x += (parseInt(CC.step / delay) % sprite.frames) * response.w;
	            }
	        }
	    } else {
	    	response.w = 0;
	    	response.h = 0;
	    }

        return response;

    };

    var drawText = function(layr, config, scr, drawMethod) {
    	var lineHeight = config.font.lineHeight || layr.font.size;

    	var prelines = layr.text.split("\n");
        var y = 0;

    	for (var i = 0; i < prelines.length; i++) {

	        var words = prelines[i].split(' ');
	        var line = '';

	        for (var n = 0; n < words.length; n++) {
				var testLine = line + words[n] + ' ';
				var metrics = scr.context.measureText(testLine);
				var testWidth = metrics.width;

				if (testWidth > config.FW && n > 0) {
					drawMethod(line, 0, y);
					line = words[n] + ' ';
					y += lineHeight;
				} else {
					line = testLine;
				}
	        }

        	drawMethod(line, 0, y);
        	y += lineHeight;
        }
    };

    /****************************************************************************************/
    /**      ************************************************************************      **/
    /******      ****************************************************************      ******/
    /**********      ********************************************************      **********/
    /**************      ************************************************      **************/
    /*******                *****************************************                ********/
    /**************      ************************************************      **************/
    /**********      ********************************************************      **********/
    /******      ****************************************************************      ******/
    /**     ****************************                  ***************************      **/
    /*********************************    ***************    ********************************/
    /****************************************************************************************/
    /* @melanke - 30/11/2014 ****************************************************************/

    /**
    * creates a transition step between origin and destination and put it on target
    */
    CC.transformLayer = function (element, opt, percentage) {

        var config = configDrawing(element, opt.origin);

        opt.target.zIndex = transformNumber(opt.origin.zIndex, opt.destination.zIndex, percentage, 0);

        transformShapeWidthHeightAndRoundedB(opt.target, opt.origin, opt.destination, percentage, config);

        opt.target.text = transformNoTween(opt.origin.text, opt.destination.text, percentage);
        opt.target.blendMode = transformNoTween(opt.origin.blendMode, opt.destination.blendMode, percentage);

        transformFont(opt.target, opt.origin, opt.destination, percentage, config);

        opt.target.offsetX = transformNumber(opt.origin.offsetX, opt.destination.offsetX, percentage, 0);
        opt.target.offsetY = transformNumber(opt.origin.offsetY, opt.destination.offsetY, percentage, 0);
        opt.target.angle = transformNumber(opt.origin.angle, opt.destination.angle, percentage, 0);

        transformAnchor(opt.target, opt.origin, opt.destination, percentage, config, element);
        transformFlipAndScale(opt.target, opt.origin, opt.destination, percentage, config);
        opt.target.alpha = transformNumber(opt.origin.alpha, opt.destination.alpha, percentage, 1);
        transformShadow(opt.target, opt.origin, opt.destination, percentage, config);
        transformFill(opt.target, opt.origin, opt.destination, percentage, config);
        transformStroke(opt.target, opt.origin, opt.destination, percentage, config);
        transformSprite(opt.target, opt.origin, opt.destination, percentage, config);
        transformTiles(opt.target, opt.origin, opt.destination, percentage, config);


    };

    var pctCalc = function(originVal, destVal, pct) {
        var diff = destVal - originVal;

        return !diff ? originVal : originVal + (diff / 100 * pct);
    };

    var transformNumber = function(originVal, destVal, pct, defaultV) {

        if (originVal === destVal) 
        {
            return originVal || defaultV;
        }

        var originVal = !CC.isNumber(originVal) ? defaultV 
            : originVal;
        var destVal = !CC.isNumber(destVal) ? defaultV 
            : destVal;
        return pctCalc(originVal, destVal, pct);
    };

    var transformColor = function(originVal, destVal, pct, defaultV) {

        if (originVal === destVal) 
        {
            return originVal;
        }

        var defaultVC = new CC.Color(defaultV);
        var originValC = new CC.Color(originVal);
        var destValC = new CC.Color(destVal);

        if (!defaultVC.valid) {
            if (originValC.valid) {
                defaultVC = new CC.Color([ originValC.C, originValC.M, originValC.Y, originValC.K, 0]);
            } else if (destValC.valid) {
                defaultVC = new CC.Color([ destValC.C, destValC.M, destValC.Y, destValC.K, 0]);
            } else {
                defaultVC = new CC.Color([ 0, 0, 0, 0, 0]);
            }
        }

        if (!originValC.valid) {
            originValC = defaultVC;
        }

        if (!destValC.valid) {
            destValC = defaultVC;
        }

        return originValC.mixWith(destValC, pct).str;
    };

    var transformNoTween = function(originVal, destVal, pct) {

        if (originVal == destVal) {
            return originVal;
        } else if (pct < 50) {
            return originVal;
        } else {
            return destVal;
        }

    };

    var createSolidGradient = function(color, gradient) {
        var resp = {};

        for (var g in gradient) {
            if (g === "start" || g === "end" || g === "innerCircle" || g === "outerCircle") {
                resp[g] = gradient[g];
            } else {
                resp[g] = color;
            }
        }

        return resp;
    };

    var transformLinearGradient = function(olinearg, dlinearg, percentage) {
        if (!olinearg && !dlinearg) {
            return;
        }

        var olinearg = olinearg || {};
        var dlinearg = dlinearg || {};

        var linearGradient = {};

        if (olinearg.start || dlinearg.start) {
            var ostart = olinearg.start || [];
            var dstart = dlinearg.start || [];

            linearGradient.start = [
                transformNumber(ostart[0], dstart[0], percentage, 0),
                transformNumber(ostart[1], dstart[1], percentage, 0)
            ];
        }

        if (olinearg.end || dlinearg.end) {
            var oend = olinearg.end || [];
            var dend = dlinearg.end || [];

            linearGradient.end = [
                transformNumber(oend[0], dend[0], percentage, 100),
                transformNumber(oend[1], dend[1], percentage, 0)
            ];
        }

        for (var ol in olinearg) {
            if (ol === "start" || ol === "end") {
                continue;
            }

            if (dlinearg[ol]){
                linearGradient[ol] = transformColor(olinearg[ol], dlinearg[ol], percentage, "black");
            } else if (percentage < 50) {
                linearGradient[ol] = olinearg[ol];
            }
        }

        for (var dl in dlinearg) {
            if (dl !== "start" && dl !== "end" && !olinearg[dl] && percentage >= 50) {
                linearGradient[dl] = dlinearg[dl];
            }
        }

        return linearGradient;
    };

    var transformRadialGradient = function(oradg, dradg, percentage) {
        if (!oradg && !dradg) {
            return;
        }

        var oradg = oradg || {};
        var dradg = dradg || {};

        var radialGradient = {};

        if (oradg.innerCircle || dradg.innerCircle) {
            var oinner = oradg.innerCircle || {};
            var dinner = dradg.innerCircle || {};

            radialGradient.innerCircle = {
                centerX: transformNumber(oinner.centerX, dinner.centerX, percentage, 50),
                centerY: transformNumber(oinner.centerY, dinner.centerY, percentage, 50),
                radius: transformNumber(oinner.radius, dinner.radius, percentage, 0)
            };
        }

        if (oradg.outerCircle || dradg.outerCircle) {
            var oouter = oradg.outerCircle || {};
            var douter = dradg.outerCircle || {};

            radialGradient.outerCircle = {
                centerX: transformNumber(oouter.centerX, douter.centerX, percentage, 50),
                centerY: transformNumber(oouter.centerY, douter.centerY, percentage, 50),
                radius: transformNumber(oouter.radius, douter.radius, percentage, 100),
            };
        }

        for (var ol in oradg) {
            if (ol === "innerCircle" || ol === "outerCircle") {
                continue;
            }

            if (dradg[ol]) {
                radialGradient[ol] = transformColor(oradg[ol], dradg[ol], percentage, "black");
            } else if (percentage < 50) {
                radialGradient[ol] = oradg[ol];
            }
        }

        for (var dl in dradg) {
            if (dl !== "innerCircle" && dl !== "outerCircle" && !oradg[dl] && percentage >= 50) {
                radialGradient[dl] = dradg[dl];
            }
        }

        return radialGradient;
    };

    var transformShapeWidthHeightAndRoundedB = function(target, origin, destination, percentage, config) {

        target.w = transformNumber(origin.w, destination.w, percentage, config.FW);
        target.h = transformNumber(origin.h, destination.h, percentage, config.FH);

        var oshape = !CC.isString(origin.shape) ? "rect" : origin.shape;
        var dshape = !CC.isString(destination.shape) ? "rect" : destination.shape;
        if (oshape !== dshape) 
        {
            if (oshape === "rect" && dshape === "circle") 
            {
                target.h = transformNumber(origin.h, destination.w, percentage, config.FH);

                var oroundedBorderRadius = !CC.isNumber(origin.roundedBorderRadius) ? 0 
                    : origin.roundedBorderRadius;
                var droundedBorderRadius = (Math.min(target.w, target.h) / 2);
                target.shape = "rect";
                target.roundedBorderRadius = pctCalc(oroundedBorderRadius, droundedBorderRadius, percentage);
            } 
            else if (oshape === "circle" && dshape === "rect") 
            {
                var droundedBorderRadius = !CC.isNumber(destination.roundedBorderRadius) ? 0 
                    : destination.roundedBorderRadius;
                var oroundedBorderRadius = target.w / 2;
                target.shape = "rect";
                target.roundedBorderRadius = pctCalc(oroundedBorderRadius, droundedBorderRadius, percentage);
            } 
            else
            {
                if (percentage < 50) {
                    target.shape = origin.shape;
                } else {
                    target.shape = destination.shape;
                }
            }
        } else {
            target.shape = origin.shape;

            target.roundedBorderRadius = transformNumber(
                origin.roundedBorderRadius, 
                destination.roundedBorderRadius, 
                percentage, 0);
        }
    };

    var transformFont = function(target, origin, destination, percentage, config) {
        //size
        target.font = {};
        var ofont = origin.font || {};
        var dfont = destination.font || {};

        target.font.size = transformNumber(ofont.size, dfont.size, percentage, 0);

        //baseline
        var obaseline = !CC.isString(ofont.baseline) ? "top" : ofont.baseline;
        var dbaseline = !CC.isString(dfont.baseline) ? "top" : dfont.baseline;
        if (obaseline !== dbaseline) {
            if (percentage < 50) {
                target.font.baseline = ofont.baseline;
            } else {
                target.font.baseline = dfont.baseline;
            }
        }
        else
        {
            target.font.baseline = ofont.baseline;
        }

        //style
        var ostyle = !CC.isString(ofont.style) ? "normal" : ofont.style;
        var dstyle = !CC.isString(dfont.style) ? "normal" : dfont.style;
        if (ostyle !== dstyle) {
            if (percentage < 50) {
                target.font.style = ofont.style;
            } else {
                target.font.style = dfont.style;
            }
        }
        else
        {
            target.font.style = ofont.style;
        }

        //weight
        var oweight = !ofont.weight ? "normal" : ofont.weight;
        var dweight = !dfont.weight ? "normal" : dfont.weight;
        if (oweight !== dweight) {
            if (percentage < 50) {
                target.font.weight = ofont.weight;
            } else {
                target.font.weight = dfont.weight;
            }
        }
        else
        {
            target.font.weight = ofont.weight;
        }

        //family
        var ofamily = !CC.isString(ofont.family) ? "sans-serif" : ofont.family;
        var dfamily = !CC.isString(dfont.family) ? "sans-serif" : dfont.family;
        if (ofamily !== dfamily) {
            if (percentage < 50) {
                target.font.family = ofont.family;
            } else {
                target.font.family = dfont.family;
            }
        }
        else
        {
            target.font.family = ofont.family;
        }
        
    };

    var transformAnchor = function(target, origin, destination, percentage, config, el) {
        var oanchor = origin.anchor || el.anchor || {};
        var danchor = destination.anchor || el.anchor || {};

        target.anchor = {
            x: transformNumber(oanchor.x, danchor.x, percentage, config.EW / 2),
            y: transformNumber(oanchor.y, danchor.y, percentage, config.EH / 2)
        };
        
    };

    var transformFlipAndScale = function(target, origin, destination, percentage, config) {

        var oscalex = origin.scale && CC.isNumber(origin.scale.x) ? origin.scale.x : 1;
        var oscaley = origin.scale && CC.isNumber(origin.scale.y) ? origin.scale.y : 1;
        var dscalex = destination.scale && CC.isNumber(destination.scale.x) ? destination.scale.x : 1;
        var dscaley = destination.scale && CC.isNumber(destination.scale.y) ? destination.scale.y : 1;

        if (CC.isString(origin.flip)){
            if (origin.flip.indexOf("x") != -1) {
                oscalex *= -1;
            }

            if (origin.flip.indexOf("y") != -1) {
                oscaley *= -1;
            }
        }

        if (CC.isString(destination.flip)){
            if (destination.flip.indexOf("x") != -1) {
                dscalex *= -1;
            }

            if (destination.flip.indexOf("y") != -1) {
                dscaley *= -1;
            }
        }

        target.scale = {
            x: transformNumber(oscalex, dscalex, percentage, 1),
            y: transformNumber(oscaley, dscaley, percentage, 1)
        };

    };

    var transformShadow = function(target, origin, destination, percentage, config) {

        var oshadow = origin.shadow || {};
        var dshadow = destination.shadow || {};

        target.shadow = {
            blur: transformNumber(oshadow.blur, dshadow.blur, percentage, 0),
            color: transformColor(oshadow.color, dshadow.color, percentage, "black"),
            x: transformNumber(oshadow.x, dshadow.x, percentage, 0),
            y: transformNumber(oshadow.y, dshadow.y, percentage, 0)
        };
    };

    var transformFill = function(target, origin, destination, percentage, config) {
        var ofill = origin.fill || {};
        var dfill = destination.fill || {};

        target.fill = {};

        var ocolor = ofill.color;
        var dcolor = dfill.color;
        var olinearg = ofill.linearGradient;
        var dlinearg = dfill.linearGradient;
        var oradialg = ofill.radialGradient;
        var dradialg = dfill.radialGradient;

        //let the color transform to gradient
        if (ocolor && !dcolor) {
            if (olinearg) {
                ocolor = undefined;
            } else if (dlinearg) {
                olinearg = createSolidGradient(ocolor, dlinearg);
                ocolor = undefined;
            } else if (dradialg) {
                oradialg = createSolidGradient(ocolor, dradialg);
                ocolor = undefined;
            }
        } else if (!ocolor && dcolor) {
            if (dlinearg) {
                dcolor = undefined;
            } else if (olinearg) {
                dlinearg = createSolidGradient(dcolor, olinearg);
                dcolor = undefined;
            } else if (oradialg) {
                dradialg = createSolidGradient(dcolor, oradialg);
                dcolor = undefined;
            }
        }

        target.fill.color = transformColor(ocolor, dcolor, percentage, undefined);
        target.fill.linearGradient = transformLinearGradient(olinearg, dlinearg, percentage);
        target.fill.radialGradient = transformRadialGradient(oradialg, dradialg, percentage);
        
    };

    var transformStroke = function(target, origin, destination, percentage, config) {
        var ostroke = origin.stroke || {};
        var dstroke = destination.stroke || {};

        target.stroke = {};

        var ocolor = ostroke.color;
        var dcolor = dstroke.color;
        var olinearg = ostroke.linearGradient;
        var dlinearg = dstroke.linearGradient;
        var oradialg = ostroke.radialGradient;
        var dradialg = dstroke.radialGradient;

        //let the color transform to gradient
        if (ocolor && !dcolor) {
            if (olinearg) {
                ocolor = undefined;
            } else if (dlinearg) {
                olinearg = createSolidGradient(ocolor, dlinearg);
                ocolor = undefined;
            } else if (dradialg) {
                oradialg = createSolidGradient(ocolor, dradialg);
                ocolor = undefined;
            }
        } else if (!ocolor && dcolor) {
            if (dlinearg) {
                dcolor = undefined;
            } else if (olinearg) {
                dlinearg = createSolidGradient(dcolor, olinearg);
                dcolor = undefined;
            } else if (oradialg) {
                dradialg = createSolidGradient(dcolor, oradialg);
                dcolor = undefined;
            }
        }

        target.stroke.color = transformColor(ocolor, dcolor, percentage, undefined);
        target.stroke.linearGradient = transformLinearGradient(olinearg, dlinearg, percentage);
        target.stroke.radialGradient = transformRadialGradient(oradialg, dradialg, percentage);
        
        target.stroke.thickness = transformNumber(ostroke.thickness, dstroke.thickness, percentage, 0);
        target.stroke.cap = transformNoTween(ostroke.cap, dstroke.cap, percentage);
        target.stroke.join = transformNoTween(ostroke.join, dstroke.join, percentage);
        target.stroke.dash = transformNoTween(ostroke.dash, dstroke.dash, percentage);
    };

    var transformSprite = function(target, origin, destination, percentage, config) {
        var osprite = origin.sprite || {};
        var dsprite = destination.sprite || {};

        target.sprite = {};
        target.sprite.url = transformNoTween(osprite.url, dsprite.url, percentage);
        target.stroke.x = transformNumber(osprite.x, dsprite.x, percentage, 0);
        target.stroke.y = transformNumber(osprite.y, dsprite.y, percentage, 0);

        if (target.sprite.url && target.sprite.url.length) { 
            var res = CC.useResource(target.sprite.url);
            target.sprite.w = transformNumber(osprite.w, dsprite.w, percentage, Math.min(config.FW, res.width));
            target.sprite.h = transformNumber(osprite.h, dsprite.h, percentage, Math.min(config.FH, res.height));
        }

        target.stroke.delay = transformNumber(osprite.delay, dsprite.delay, percentage, 1);
        target.stroke.frames = transformNumber(osprite.frames, dsprite.frames, percentage, 1);
        target.sprite.vertical = transformNoTween(osprite.vertical, dsprite.vertical, percentage);
        target.sprite.repeat = transformNoTween(osprite.repeat, dsprite.repeat, percentage);

    };

    var transformTiles = function(target, origin, destination, percentage, config) {
        var otileSize = origin.tileSize || {};
        var dtileSize = destination.tileSize || {};

        target.tileSize = {};
        target.tileSize.w = transformNumber(otileSize.w, dtileSize.w, percentage, 16);
        target.tileSize.h = transformNumber(otileSize.h, dtileSize.h, percentage, 16);

        target.tiles = transformNoTween(origin.tiles, destination.tiles, percentage);
    };

})();