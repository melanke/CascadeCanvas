

CC.drawer = new (function(){

	this.draw = function(){
	    CC.context.clearRect(0, 0 , CC.screen.w, CC.screen.h);

	    CC("*").sort("zIndex", true).each(function(){

	        drawElement(this);

	    });
	};

	var drawElement = function(el) {

		if (el.hidden === true) {
            return;
        }

        var layers = CC.sort(el.layers, "zIndex", true);

        for (var s in layers) {
            var layr = layers[s];
            if (CC.isFunction(layr)) {
                layr.call(el);
            } else {
                drawLayer(el, layr);
            }
        }

	};

	/**
    * {
    *       hidden: true, //make the layer invisible
    *       alpha: 0.5, //semi transparent by 50%
    *       zIndex: 3, //the less zIndex is most visible it is (in in front of other layers)
    *       offsetX: 10, //layer will be 10 to the right
    *       offsetY: 10, //10 to the bottom
    *       w: 10, 
    *       h: 10, 
    *       shape: "rect", //could be 'circle' or an array of points to form a polygon [ [0,0], [50, 50], [0, 50] ]
    *       flip: "xy", //flip layer horizontally and vertically
    *       angle: 30, //rotated 30 degrees
    *       anchor: { //point where the rotation will anchor
    *           x: 10, //x and y from element x and y
    *           y: 10
    *       },
    *       scale: {
    *           x: 2, //will strech horizontaly
    *           y: 0.5 //will squeeze vertically
    *       },
    *       stroke: {
    *           color: "#330099",
    *           thickness: 5,
    *           cap: "butt", //style of the ends of the line
    *           join: "bevel" //style of the curves of the line
    *       },
    *       fill: {
    *           linearGradient: {
    *               start: [0, 0], //percentage of start point
    *               end: [100, 100], //percentage of the end point
    *               "0": "rgba(200, 100, 100, 0.8)", //color stops (beginning)
    *               "0.5": "#f00", //(middle)
    *               "1": "#0000dd" //(end)
    *           },
    *           radialGradient: {
    *               innerCircle: {
    *                   centerX: 25, //percentage of the position of the inner circle
    *                   centerY: 25, //percentage of the position of the inner circle
    *                   radius: 20 //percentage of the radius of the inner circle
    *               },
    *               outerCircle: {
    *                   centerX: 75, //percentage of the position of the inner circle
    *                   centerY: 75, //percentage of the position of the inner circle
    *                   radius: 50 //percentage of the radius of the inner circle
    *               },
    *               "0": "rgba(200, 100, 100, 0.8)", //color stops (beginning)
    *               "0.5": "#f00", //(middle)
    *               "1": "#0000dd" //(end)
    *           }
    *       },
    *       sprite: {
    *           url: "res/player.png", //image url
    *           x: 160, //x position of the sprite in the image
    *           y: 48, //y position of the sprite in the image
    *           w: 16, //width of consideration
    *           h: 24, //height of consideration
    *           repeat: "xy", //if the string contain x - repeat horizontaly; if the string contain y - repeat verticaly
    *           frames: 5, //how many frames of the animation,
    *           delay: 10 //how many loops until the next frame
    *       }
    * }
    */
	var drawLayer = function(el, layr) {

		/** PRE VERIFICATIONS AND INICIALIZATION BEFORE DRAW **/

		//if the layer is hidden we dont need to draw it
		if (!layr || layr.hidden === true) {
            return;
        }

        var config = configDrawing(el, layr);

        //dont draw if it isn't in screen range
        var normalSX = CC.screen.x * -1;
        var normalSY = CC.screen.y * -1;
        if (el.x + config.offsetX + config.FW < normalSX
        || el.x + config.offsetX - config.FW > normalSX + CC.screen.w
        || el.y + config.offsetY + config.FH < normalSY
        || el.y + config.offsetY - config.FH > normalSY + CC.screen.h) {
            return;
        }

        //save context to be able to restore to this state
        CC.context.save();

        //draw the layer relative to screen x and y (to offset the camera position)
        CC.context.translate(CC.screen.x, CC.screen.y);

        //translate the canvas to the x, y of the element to draw it from 0, 0
        CC.context.translate(el.x, el.y);

        /** OK, NOW LETS DO THIS! **/
        setElementRotation(el, config);
        setLayerRotation(el, layr, config);
        setLayerOffset(config);
        setElementFlip(el, config);
        setLayerFlip(layr, config);
        setLayerScale(layr, config);
        setLayerAlpha(layr);
        setLayerFill(layr, config);
        setLayerStroke(layr, config);
        setLayerSpriteOrTile(layr, config);

        CC.context.restore();

	};

	var configDrawing = function(el, layr){

		//drawing configuration
        var config = {};

        //defining a Width and Height of the element
        config.EW = el.w,
        config.EH = el.h;
        //if it is a polygon and dont have W and H we discover it
        if (CC.isArray(layr.shape) && (!el.w || !el.h)) {
            config.EW = el.w || 0;
            config.EH = el.h || 0;
            for (var i in layr.shape) {
                config.EW = Math.max(config.EW, layr.shape[i][0]);
                config.EH = Math.max(config.EH, layr.shape[i][1]);
            }
        }

        config.offsetX = layr.offsetX || 0,
        config.offsetY = layr.offsetY || 0,
        config.FW = layr.w || config.EW, //final W
        config.FH = layr.h || config.EH; //final H

        return config;

	};

	var setElementRotation = function(el, config) {
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
            CC.context.translate(el.anchor.x, el.anchor.y);
            //rotate
            CC.context.rotate(el.angle * Math.PI/-180);
            //get back to previous 0, 0
            CC.context.translate(-el.anchor.x, -el.anchor.y);
        }
	};

	var setLayerRotation = function(el, layr, config) {
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
            CC.context.translate(layr.anchor.x, layr.anchor.y);
            //rotate
            CC.context.rotate(layr.angle * Math.PI/-180);
            //get back to previous 0, 0
            CC.context.translate(-layr.anchor.x, -layr.anchor.y);
        }
	};

	var setLayerOffset = function(config) {
		//translate to the chosen offset
        CC.context.translate(
            config.offsetX - ((config.FW - config.EW) / 2), 
            config.offsetY - ((config.FH - config.EH) / 2)
        );
	};

	var setElementFlip = function(el, config) {
		//flipping the element
        if (el.flip && el.flip.length) {
            var scaleHor = el.flip.indexOf("x") != -1 ? -1 : 1;
            var scaleVer = el.flip.indexOf("y") != -1 ? -1 : 1;

            //translate to the center
            CC.context.translate(config.FW/2, config.FH/2);
            //scale
            CC.context.scale(scaleHor, scaleVer);
            //translate back to 0, 0
            CC.context.translate(-config.FW/2, -config.FH/2);
        }
	};

	var setLayerFlip = function(layr, config) {
		//flipping the layer
        if (layr.flip && layr.flip.length) {
            var scaleHor = layr.flip.indexOf("x") != -1 ? -1 : 1;
            var scaleVer = layr.flip.indexOf("y") != -1 ? -1 : 1;

            //translate to the center
            CC.context.translate(config.FW/2, config.FH/2);
            //scale
            CC.context.scale(scaleHor, scaleVer);
            //translate back to 0, 0
            CC.context.translate(-config.FW/2, -config.FH/2);
        }
	};

	var setLayerScale = function(layr, config) {
		//scale - if want to stretch or squeeze the layer
        if (layr.scale && (layr.scale.x || layr.scale.y)) {

            //translate to the center
            CC.context.translate(config.FW/2, config.FH/2);
            //scale
            CC.context.scale(layr.scale.x || 1, layr.scale.y || 1);
            //translate back to 0, 0
            CC.context.translate(-config.FW/2, -config.FH/2);
        }
	};

	var setLayerAlpha = function(layr) {
		//alpha - semi transparent options
		if (layr.alpha != undefined && layr.alpha < 1) {
            CC.context.globalAlpha = layr.alpha;
        } else {
            CC.context.globalAlpha = 1;
        }
	};

	var setLayerFill = function(layr, config) {
		
		if (!layr.fill) {
			return;
		}

		setLayerFillStyle(layr, config);

        //draw a rectangle
        if (layr.shape === "rect" || layr.shape === undefined) {

            if (!layr.roundedBorderRadius) {
                CC.context.fillRect(0, 0, config.FW, config.FH);
            } else {
                createRoundedBorder(config.FW, config.FH, layr.roundedBorderRadius);
                CC.context.fill();
            }

        //draw a circle
        } else if (layr.shape === "circle") {

            createCircle(config);
            CC.context.fill();

        //draw a polygon
        } else if (CC.isArray(layr.shape)) {

            createPolygon(layr);
            CC.context.fill();

        }
	};

	var setLayerStroke = function(layr, config) {
		//stroke
        if (!layr.stroke) {
        	return;
        }

        setLayerStrokeStyle(layr, config);

        //draw a rectangle
        if (layr.shape === "rect" || layr.shape === undefined) {

            if (!layr.roundedBorderRadius) {
                CC.context.strokeRect(0, 0, config.FW, config.FH);
            } else {
                createRoundedBorder(config.FW, config.FH, layr.roundedBorderRadius);
                CC.context.stroke();
            }

        //draw a circle
        } else if (layr.shape === "circle") {

            createCircle(config);

            CC.context.stroke();

        //draw a polygon
        } else if (CC.isArray(layr.shape)) {

            createPolygon(layr);
            CC.context.stroke();

        }
        
	};

    var setLayerSpriteOrTile = function(layr, config) {
        //sprite
        if (layr.sprite && layr.sprite.url) {

            setLayerSprite(layr, config);            

        } else if (layr.tiles) {

            setLayerTiles(layr, config);
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


	var setLayerFillStyle = function(layr, config) {
		//by color
        if (layr.fill.color && CC.isString(layr.fill.color)) {

            CC.context.fillStyle = layr.fill.color;

        //by linear gradient
        } else if (layr.fill.linearGradient) {

            CC.context.fillStyle = createLinearGradient(layr.fill.linearGradient, config.FW, config.FH);
        
        //by radial gradient    
        } else if (layr.fill.radialGradient) {

            CC.context.fillStyle = createRadialGradient(layr.fill.radialGradient, config.FW, config.FH);

        }

	};

	var setLayerStrokeStyle = function(layr, config) {
		//by color
        if (layr.stroke.color && CC.isString(layr.stroke.color)) {

            CC.context.strokeStyle = layr.stroke.color;

        //by linearGradient
        } else if (layr.stroke.linearGradient) {

            CC.context.strokeStyle = createLinearGradient(layr.stroke.linearGradient, config.FW, config.FH);
            
        //by radial gradient 
        } else if (layr.fill.radialGradient) {

            CC.context.strokeStyle = createRadialGradient(layr.stroke.radialGradient, config.FW, config.FH);

        }
	};

    var setLayerSprite = function(layr, config){

        limitSprite(layr, config);
        var sprite = createSprite(layr.sprite, config.FW, config.FH);

        var startX = 0;
        var startY = 0;
        var repeatX = layr.sprite.repeat && layr.sprite.repeat.indexOf("x") != -1;
        var repeatY = layr.sprite.repeat && layr.sprite.repeat.indexOf("y") != -1;

        //repeat like a pattern if repeatX or repeatY is true
        do {
            startY = 0;
            do {

                CC.context.drawImage(sprite.res, sprite.x, sprite.y, sprite.w, sprite.h, startX, startY, sprite.w, sprite.h);
                
                if (repeatY) {
                    startY += sprite.h;
                }
            } while (startY < config.EH && repeatY);

            if (repeatX) {
                startX += sprite.w;
            }

        } while (startX < config.EW && repeatX);
    };

    var setLayerTiles = function(layr, config) {
        
        limitSprite(layr, config);

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
                CC.context.drawImage(sprite.res, sprite.x, sprite.y, sprite.w, sprite.h, startX, startY, sprite.w, sprite.h);

                startX += tw;
            }
            startY += th;
        }
    };

	var createCircle = function(config) {
		CC.context.beginPath();

        CC.context.arc(
            config.FW / 2, 
            config.FW / 2, 
            config.FW / 2,
            0, 2 * Math.PI);

        CC.context.closePath();
	};

	var createPolygon = function(layr) {
		CC.context.beginPath();
        CC.context.moveTo(layr.shape[0][0], layr.shape[0][1]);

        for (var p in layr.shape) {
            var point = layr.shape[p];
            CC.context.lineTo(point[0], point[1]);
        }
        
        CC.context.closePath();
	};

    var createLinearGradient = function(linearGradient, FW, FH){

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

        var gradient = CC.context.createLinearGradient(x1, y1, x2, y2);

        for (var s in linearGradient) {
            var stop = parseFloat(s);
            if (!isNaN(stop) && isFinite(stop)) {
                gradient.addColorStop(stop, linearGradient[s]);
            }
        }

        return gradient;

    };

    var createRadialGradient = function(radialGradient, FW, FH){

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

        var gradient = CC.context.createRadialGradient(x1, y1, r1, x2, y2, r2);

        for (var s in radialGradient) {
            var stop = parseFloat(s);
            if (!isNaN(stop) && isFinite(stop)) {
                gradient.addColorStop(stop, radialGradient[s]);
            }
        }

        return gradient;

    };

    var createRoundedBorder = function(FW, FH, radius){
        CC.context.beginPath();
        CC.context.moveTo(radius, 0);
        CC.context.lineTo(FW-radius, 0);
        CC.context.quadraticCurveTo(FW, 0, FW, radius);
        CC.context.lineTo(FW, FH-radius);
        CC.context.quadraticCurveTo(FW, FH, FW-radius, FH);
        CC.context.lineTo(radius, FH);
        CC.context.quadraticCurveTo(0, FH, 0, FH-radius);
        CC.context.lineTo(0, radius);
        CC.context.quadraticCurveTo(0, 0, radius, 0);
        CC.context.closePath();
    };

    var limitSprite = function(layr, config){
        //limit the sprite with a rectangle
        if (layr.shape === "rect" || layr.shape === undefined) {

            if (!layr.roundedBorderRadius) {
                CC.context.beginPath();
                CC.context.moveTo(0, 0);
                CC.context.lineTo(config.FW, 0);
                CC.context.lineTo(config.FW, config.FH);
                CC.context.lineTo(0, config.FH);
                CC.context.closePath();
            } else {
                createRoundedBorder(config.FW, config.FH, layr.roundedBorderRadius);
            }

            CC.context.clip();

        //limit the sprite with a circle
        } else if (layr.shape === "circle") {

            createCircle(config);
            CC.context.clip();

        //limit the sprite with a polygon
        } else if (CC.isArray(layr.shape)) {

            createPolygon(layr);
            CC.context.clip();

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