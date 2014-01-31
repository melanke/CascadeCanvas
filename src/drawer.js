/***** DRAWER *****/

//depends on typeChecker, event, objectTools, resource
//is dependency of loop

(function(){

    CC.screens = [];
    CC.tiles = {};
    CC.step = 0; //each loop increments the step, it is used for animation proposes

	CC.draw = function(){

        for (var i in CC.screens) {
            var scr = CC.screens[i];

    	    scr.context.clearRect(0, 0 , scr.w, scr.h);

    	    CC("*").sort("zIndex", true).each(function(){

    	        drawElement(this, scr);

    	    });

        }

        CC.step++;
	};

    CC.loadScreens = function() {

        if (!CC.screens || !CC.screens.length) {

            var canvas = document.getElementById('CascadeCanvas');

            if (canvas  && canvas.getContext) {
                canvas.onselectstart = canvasOnSelectStart;
                canvas.onclick = canvasOnClick;
                canvas.oncontextmenu = canvasOnContextMenu;

                CC.screens = [{
                    htmlId: "CascadeCanvas",
                    context: canvas.getContext("2d"),
                    x: 0,
                    y: 0,
                    w: canvas.offsetWidth,
                    h: canvas.offsetHeight,
                    setCenter: setCenter
                }];
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

                canvas.onselectstart = canvasOnSelectStart;
                canvas.onclick = canvasOnClick;
                canvas.oncontextmenu = canvasOnContextMenu;

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

    var canvasOnSelectStart = function() { return false; };
    var canvasOnClick = function(event){ CC.trigger("click", event); };
    var canvasOnContextMenu = function (event) { CC.trigger("rightclick", event); return false; };





	var drawElement = function(el, scr) {

		if (el.hidden === true) {
            return;
        }

        var layers = CC.sort(el.layers, "zIndex", true);

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
     {
           hidden: true, //make the layer invisible
           alpha: 0.5, //semi transparent by 50%
           zIndex: 3, //the less zIndex is most visible it is (in in front of other layers)
           offsetX: 10, //layer will be 10 to the right
           offsetY: 10, //10 to the bottom
           w: 10, 
           h: 10, 
           shape: "rect", //could be 'circle' or an array of points to form a polygon [ [0,0], [50, 50], [0, 50] ]
           flip: "xy", //flip layer horizontally and vertically
           angle: 30, //rotated 30 degrees
           anchor: { //point where the rotation will anchor
               x: 10, //x and y from element x and y
               y: 10
           },
           scale: {
               x: 2, //will strech horizontaly
               y: 0.5 //will squeeze vertically
           },
           stroke: {
               color: "#330099",
               thickness: 5,
               cap: "butt", //style of the ends of the line
               join: "bevel" //style of the curves of the line
           },
           fill: {
               linearGradient: {
                   start: [0, 0], //percentage of start point
                   end: [100, 100], //percentage of the end point
                   "0": "rgba(200, 100, 100, 0.8)", //color stops (beginning)
                   "0.5": "#f00", //(middle)
                   "1": "#0000dd" //(end)
               },
               radialGradient: {
                   innerCircle: {
                       centerX: 25, //percentage of the position of the inner circle
                       centerY: 25, //percentage of the position of the inner circle
                       radius: 20 //percentage of the radius of the inner circle
                   },
                   outerCircle: {
                       centerX: 75, //percentage of the position of the inner circle
                       centerY: 75, //percentage of the position of the inner circle
                       radius: 50 //percentage of the radius of the inner circle
                   },
                   "0": "rgba(200, 100, 100, 0.8)", //color stops (beginning)
                   "0.5": "#f00", //(middle)
                   "1": "#0000dd" //(end)
               }
           },
           shadow: {
               x: 0,
               y: 3,
               blur: 3,
               color: "#000000"
           },
           sprite: {
               url: "res/player.png", //image url
               x: 160, //x position of the sprite in the image
               y: 48, //y position of the sprite in the image
               w: 16, //width of consideration
               h: 24, //height of consideration
               repeat: "xy", //if the string contain x - repeat horizontaly; if the string contain y - repeat verticaly
               frames: 5, //how many frames of the animation,
               delay: 10 //how many loops until the next frame
           }
     }
    */
	var drawLayer = function(el, layr, scr) {

		/** PRE VERIFICATIONS AND INICIALIZATION BEFORE DRAW **/

		//if the layer is hidden we dont need to draw it
		if (!layr || layr.hidden === true) {
            return;
        }

        var config = configDrawing(el, layr, scr);

        //dont draw if it isn't in screen range
        if (!isElementInScreenRange(el, config, scr)) {
            return;
        }

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
        setLayerShadow(layr, scr);
        setLayerFill(layr, config, scr);
        setLayerStroke(layr, config, scr);
        setLayerSpriteOrTile(layr, config, scr);

        scr.context.restore();

	};

	var configDrawing = function(el, layr, scr){

		//drawing configuration
        var config = {};

        //defining a Width and Height of the element
        config.EW = el.w,
        config.EH = el.h;

        //if it is a text, config the font
        if (layr.shape === "text" && CC.isString(layr.text)) {
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

                scr.context.font = config.font;

                config.EW = el.w || scr.context.measureText(layr.text).width;
                config.EH = el.h || layr.font.size * 1.5;
            }

        }

        config.offsetX = layr.offsetX || 0,
        config.offsetY = layr.offsetY || 0,
        config.FW = layr.w || config.EW, //final W
        config.FH = layr.h || config.EH; //final H

        return config;

	};

    var isElementInScreenRange = function(el, config, scr) {

        var sX = scr.x;
        var sY = scr.y;
        
        if (el.fixedOnScreen === true || el.fixedOnScreen === scr.htmlId) {
            sX = 0;
            sY = 0;
        }

        return (el.x + config.offsetX + config.FW >= sX
        && el.x + config.offsetX - config.FW <= sX + scr.w
        && el.y + config.offsetY + config.FH >= sY
        && el.y + config.offsetY - config.FH <= sY + scr.h);
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
            config.offsetX - ((config.FW - config.EW) / 2), 
            config.offsetY - ((config.FH - config.EH) / 2)
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
        if (layr.scale && (layr.scale.x || layr.scale.y)) {

            //translate to the center
            scr.context.translate(config.FW/2, config.FH/2);
            //scale
            scr.context.scale(layr.scale.x || 1, layr.scale.y || 1);
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

	var setLayerFill = function(layr, config, scr) {
		
		if (!layr.fill) {
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
            scr.context.fillText(layr.text, 0, 0);

        //draw a polygon
        } else if (CC.isArray(layr.shape)) {

            createPolygon(layr, scr);
            scr.context.fill();

        }
	};

	var setLayerStroke = function(layr, config, scr) {
		//stroke
        if (!layr.stroke) {
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
            scr.context.strokeText(layr.text, 0, 0);

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
    /* @melanke - 13/11/2013                                                                */


	var setLayerFillStyle = function(layr, config, scr) {
		//by color
        if (layr.fill.color && CC.isString(layr.fill.color)) {

            scr.context.fillStyle = layr.fill.color;

        //by linear gradient
        } else if (layr.fill.linearGradient) {

            scr.context.fillStyle = createLinearGradient(layr.fill.linearGradient, config.FW, config.FH, scr);
        
        //by radial gradient    
        } else if (layr.fill.radialGradient) {

            scr.context.fillStyle = createRadialGradient(layr.fill.radialGradient, config.FW, config.FH, scr);

        }

	};

	var setLayerStrokeStyle = function(layr, config, scr) {
		//by color
        if (layr.stroke.color && CC.isString(layr.stroke.color)) {

            scr.context.strokeStyle = layr.stroke.color;

        //by linearGradient
        } else if (layr.stroke.linearGradient) {

            scr.context.strokeStyle = createLinearGradient(layr.stroke.linearGradient, config.FW, config.FH, scr);
            
        //by radial gradient 
        } else if (layr.stroke.radialGradient) {

            scr.context.strokeStyle = createRadialGradient(layr.stroke.radialGradient, config.FW, config.FH, scr);

        }
	};

    var setLayerSprite = function(layr, config, scr){

        limitSprite(layr, config, scr);
        var sprite = createSprite(layr.sprite, config.FW, config.FH);

        var startX = 0;
        var startY = 0;
        var repeatX = layr.sprite.repeat && layr.sprite.repeat.indexOf("x") != -1;
        var repeatY = layr.sprite.repeat && layr.sprite.repeat.indexOf("y") != -1;

        //repeat like a pattern if repeatX or repeatY is true
        do {
            startY = 0;
            do {

                scr.context.drawImage(sprite.res, sprite.x, sprite.y, sprite.w, sprite.h, startX, startY, sprite.w, sprite.h);
                
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

        var tw, th;

        if (layr.tileSize) {
            tw = layr.tileSize.w;
            th = layr.tileSize.h;
        } else {
            tw = 16;
            th = 16;
        }

        var startY = 0;

        for (var y in layr.tiles) {

            var startX = 0;

            for (var x in layr.tiles[y]) {
                var tile = CC.tiles[layr.tiles[y][x]];
                tile.w = tw;
                tile.h = th;

                var sprite = createSprite(tile, config.FW, config.FH);
                scr.context.drawImage(sprite.res, sprite.x, sprite.y, sprite.w, sprite.h, startX, startY, sprite.w, sprite.h);

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
        scr.context.lineTo(FW-radius, 0);
        scr.context.quadraticCurveTo(FW, 0, FW, radius);
        scr.context.lineTo(FW, FH-radius);
        scr.context.quadraticCurveTo(FW, FH, FW-radius, FH);
        scr.context.lineTo(radius, FH);
        scr.context.quadraticCurveTo(0, FH, 0, FH-radius);
        scr.context.lineTo(0, radius);
        scr.context.quadraticCurveTo(0, 0, radius, 0);
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
                pathText(layr.text, 0, 0);
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

        return response;

    };

})();