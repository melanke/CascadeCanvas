/***** ELEMENT *****/

//depends on typeChecker, objectTools, event, resource
//is dependency of elementlist

/**
* the base element, all elements inherit this
*/
var Element = function(specs, opts){

    var el = this,
        thisevents = {}, //events attached to this
        removed = false; //an extra protection to ignore removed elements

    this.classes = {}; //classes this inherits
    this.drawings = {}; //a Map of shapes or functions by name to be draw

    /**
    * routine for initialization:
    *  - set its ID
    *  - make it inherit the classes
    */
    var init = function(){

        var idArray = specs.match(/#[a-zA-Z0-9]*/);

        if (idArray) {
            el.id = idArray[0];
        }

        if (opts) {
            el.x = opts.x;
            el.y = opts.y;
            el.w = opts.w;
            el.h = opts.h;
            el.angle = opts.angle;
            el.anchor = opts.anchor;
            el.flip = opts.flip;
            el.hidden = opts.hidden;
            el.zIndex = opts.zIndex;
        }

        eventEnvironmentBuilder(el);

        el.inherit(specs.replace(/#[a-zA-Z0-9]*/g, ""), opts);

    };

    /**
    * invoke the constructors for this element
    * @param classesStr a string with the name of the classes to this element inherit, example:
    * 'Class1 Class2' - this element will inherit both
    */
    this.inherit = function(classesStr, opts){

        if (removed) {
            return this;
        }

        var classes = classesStr.split(" ");

        for (var i in classes) {
            var s = classes[i];

            if (s.length && !this.classes[s]) {

                this.classes[s] = CC.classes[s];

                if (CC.classes[s] && CC.classes[s].constructors) {
                        
                    for (var j in CC.classes[s].constructors) {
                        var c = CC.classes[s].constructors[j];

                        c.call(this, opts);
                    }

                } else {

                    this.classes[s] = {
                        constructors: []
                    };

                }

            }
        }

        return this;

    };

    /**
    * returns true if this element matches the specification
    * the spec could be the value you want or an expression
    * eg.: "<= 3" to check if the attribute is <= 3, the operator should be at the start
    * available operators: <, >, <=, >=, !=
    */
    this.matches = function(specs){

        var matchesRecursively = function(a, b){

            if (!a || !b) {
                return false;
            }

            for (var i in b) {

                if (a[i] === undefined) {

                    return false;

                } else if (CC.isObject(b[i])) {

                    if (matchesRecursively(a[i], b[i]) === false) {
                        return false;
                    }

                //if it is an expression we will evaluate it
                } else if ((CC.isString(b[i]))
                    && (b[i].indexOf("<") == 0 || b[i].indexOf(">") == 0 || b[i].indexOf("!=") == 0)) {

                    if (b[i].indexOf("<=") == 0 && a[i] > b[i].replace("<=", "")) {
                        return false;
                    }

                    if (b[i].indexOf("<") == 0 && a[i] >= b[i].replace("<", "")) {
                        return false;
                    }

                    if (b[i].indexOf(">=") == 0 && a[i] < b[i].replace(">=", "")) {
                        return false;
                    }

                    if (b[i].indexOf(">") == 0 && a[i] <= b[i].replace(">", "")) {
                        return false;
                    }

                    if (b[i].indexOf("!=") == 0 && a[i] == b[i].replace("!=", "")) {
                        return false;
                    }

                } else if (a[i] !== b[i]) {

                    return false;

                }

            }

            return true;

        };

        return matchesRecursively(this, specs);

    };

    /**
    * merge attributes to this element
    */
    this.merge = function(obj){

        if (removed) {
            return;
        }

        CC.merge(this, obj);

        return this;
    };

    /**
    * remove the element
    */
    this.remove = function(){

        if (removed) {
            return;
        }

        removed = true;

        CC.___remove(this);

    };

    /**
    * trigger the action when the element match the specs
    */
    this.became = function(specs, action){

        var matched = false;

        return CC.bind("enterframe", function(){

            var newmatched = el.matches(specs);

            if (!matched && newmatched) {
                action.call(el);
            }

            matched = newmatched;
        });

    };

    /**
    * trigger the action while the element match the specs
    */
    this.while = function(specs, action){

        return CC.bind("enterframe", function(){

            if (el.matches(specs)) {
                action.call(el);
            }

        });

    };

    /**
    * trigger the action when the element is clicked
    */
    this.onClick = function(action){

        return CC.bind("click", function(event){
            var x = event.offsetX;
            var y = event.offsetY;
            if (x >= el.x 
             && x <= el.x + el.w
             && y >= el.y
             && y <= el.y + el.h) {
                action.call(el);
            }
        });

    };

    this.hideAllDrawings = function() {
        for (var i in this.drawings) {
            this.drawings[i].hidden = true;
        }
    };

    this.toggleDrawings = function(toHide, toShow) {
        this.drawings[toHide].hidden = true;
        this.drawings[toShow].hidden = false;
    };

    /**
    * draw in the default way and draw the customizations in the queue
    */
    this.draw = function(){

        if (this.hidden === true) {
            return;
        }

        var drawings = CC.sort(this.drawings, "zIndex", true);

        for (var s in drawings) {
            var draw = drawings[s];
            if (CC.isFunction(draw)) {
                draw.call(this);
            } else {
                drawShape(draw);
            }
        }

    };

    /**
    * {
    *       hidden: true, //make the drawing invisible
    *       zIndex: 3, //the less zIndex is most visible it is (in the front of other drawings)
    *       offsetX: 10, //drawing will be 10 to the right
    *       offsetY: 10, //10 to the bottom
    *       offsetW: 10, //10 wider, 5 to each side
    *       offsetH: 10, //10 taller, 5 to each side,
    *       shape: "rect", //could be 'circle' or an array of points to form a polygon [ [0,0], [50, 50], [0, 50] ]
    *       angle: 30, //rotated 30 degrees
    *       flip: "xy", //flip drawing horizontally and vertically
    *       scale: {
    *           x: 2, //will strech horizontaly
    *           y: 0.5 //will squeeze vertically
    *       },
    *       anchor: { //point where the rotation will anchor
    *           x: 10, //x and y from element x and y
    *           y: 10
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
    var drawShape = function(drawing){

        if (!drawing || drawing.hidden === true) {
            return;
        }

        //defining a Width and Height of an element without width and height based on the shape polygon points
        var EW = el.w,
            EH = el.h;
        if (CC.isArray(drawing.shape) && (!el.w || !el.h)) {
            EW = el.w || 0;
            EH = el.h || 0;
            for (var i in drawing.shape) {
                EW = Math.max(EW, drawing.shape[i][0]);
                EH = Math.max(EH, drawing.shape[i][1]);
            }
        }


        var offsetX = drawing.offsetX || 0,
            offsetY = drawing.offsetY || 0,
            FW = drawing.w || EW, //final W
            FH = drawing.h || EH; //final H

        //dont draw if it isn't in screen range
        // if (el.x + offsetX + FW < CC.screen.x
        // || el.x - offsetX - FW > CC.screen.x + CC.screen.w
        // || el.y + offsetY + FH < CC.screen.y
        // || el.y - offsetY - FH > CC.screen.y + CC.screen.h) {
        //     return;
        // }

        //save context to be able to restore to this state
        CC.context.save();

        //draw the drawing relative to screen x and y (to offset the camera position)
        CC.context.translate(CC.screen.x, CC.screen.y);

        //translate the canvas to the x, y of the element to draw it from 0, 0
        CC.context.translate(el.x, el.y);

        //element rotation
        if (el.angle) {

            //element anchor point - default will be the center of element
            if (!el.anchor) {
                el.anchor = {
                    x: EW / 2,
                    y: EH / 2
                };
            }

            //translate to the anchor point
            CC.context.translate(el.anchor.x, el.anchor.y);
            //rotate
            CC.context.rotate(el.angle * Math.PI/180);
            //get back to previous 0, 0
            CC.context.translate(-el.anchor.x, -el.anchor.y);
        }

        //'drawing' rotation
        if (drawing.angle) {

            //'drawing' anchor point - default will be the center of element
            if (!drawing.anchor) {
                drawing.anchor = el.anchor || {
                    x: EW / 2,
                    y: EH / 2
                };
            }

            //translate to the anchor point
            CC.context.translate(drawing.anchor.x, drawing.anchor.y);
            //rotate
            CC.context.rotate(drawing.angle * Math.PI/180);
            //get back to previous 0, 0
            CC.context.translate(-drawing.anchor.x, -drawing.anchor.y);
        }

        //translate to the chosen offset
        CC.context.translate(
            offsetX - ((FW - EW) / 2), 
            offsetY - ((FH - EH) / 2)
        );

        //flipping the element
        if (el.flip && el.flip.length) {
            var scaleHor = el.flip.indexOf("x") != -1 ? -1 : 1;
            var scaleVer = el.flip.indexOf("y") != -1 ? -1 : 1;

            //translate to the center
            CC.context.translate(FW/2, FH/2);
            //scale
            CC.context.scale(scaleHor, scaleVer);
            //translate back to 0, 0
            CC.context.translate(-FW/2, -FH/2);
        }

        //flipping the drawing
        if (drawing.flip && drawing.flip.length) {
            var scaleHor = drawing.flip.indexOf("x") != -1 ? -1 : 1;
            var scaleVer = drawing.flip.indexOf("y") != -1 ? -1 : 1;

            //translate to the center
            CC.context.translate(FW/2, FH/2);
            //scale
            CC.context.scale(scaleHor, scaleVer);
            //translate back to 0, 0
            CC.context.translate(-FW/2, -FH/2);
        }

        //scale - if want to stretch or squeeze the drawing
        if (drawing.scale && (drawing.scale.x || drawing.scale.y)) {

            //translate to the center
            CC.context.translate(FW/2, FH/2);
            //scale
            CC.context.scale(drawing.scale.x || 1, drawing.scale.y || 1);
            //translate back to 0, 0
            CC.context.translate(-FW/2, -FH/2);
        }

        //fill
        if (drawing.fill) {

            //by color
            if (drawing.fill.color && CC.isString(drawing.fill.color)) {

                CC.context.fillStyle = drawing.fill.color;

            //by linear gradient
            } else if (drawing.fill.linearGradient) {

                CC.context.fillStyle = createLinearGradient(drawing.fill.linearGradient, FW, FH);
                
            }

            //draw a rectangle
            if (drawing.shape === "rect") {

                CC.context.fillRect(0, 0, FW, FH);

            //draw a circle
            } else if (drawing.shape === "circle") {

                CC.context.beginPath();
                
                CC.context.arc(
                    (W + offsetW) / 2, 
                    (W + offsetW) / 2, 
                    (W + offsetW) / 2,
                    0, 2 * Math.PI);

                CC.context.closePath();

                CC.context.fill();

            //draw a polygon
            } else if (CC.isArray(drawing.shape)) {

                CC.context.beginPath();
                CC.context.moveTo(drawing.shape[0][0], drawing.shape[0][1]);

                for (var p in drawing.shape) {
                    var point = drawing.shape[p];
                    CC.context.lineTo(point[0], point[1]);
                }

                CC.context.closePath();
                CC.context.fill();

            }
        }

        //stroke
        if (drawing.stroke) {

            //by color
            if (drawing.stroke.color && CC.isString(drawing.stroke.color)) {

                CC.context.strokeStyle = drawing.stroke.color;

            //by linearGradient
            } else if (drawing.stroke.linearGradient) {

                CC.context.strokeStyle = createLinearGradient(drawing.stroke.linearGradient, FW, FH);
                
            }

            //stroke thickness
            if (drawing.stroke.thickness) { 
                CC.context.lineWidth = drawing.stroke.thickness;
            }

            //stroke end style - 'butt','round' OR 'square'
            if (drawing.stroke.cap) { 
                CC.context.lineCap = drawing.stroke.cap;
            }

            //stroke curve style - 'round','bevel' OR 'miter'
            if (drawing.stroke.join) { 
                CC.context.lineJoin = drawing.stroke.join;
            }

            //draw a rectangle
            if (drawing.shape === "rect") {

                CC.context.strokeRect(0, 0,FW, FH);

            //draw a circle
            } else if (drawing.shape === "circle") {

                CC.context.beginPath();

                CC.context.arc(
                    FW / 2, 
                    FW / 2, 
                    FW / 2,
                    0, 2 * Math.PI);

                CC.context.closePath();

                CC.context.stroke();

            //draw a polygon
            } else if (CC.isArray(drawing.shape)) {

                CC.context.beginPath();
                CC.context.moveTo(drawing.shape[0][0], drawing.shape[0][1]);

                for (var p in drawing.shape) {
                    var point = drawing.shape[p];
                    CC.context.lineTo(point[0], point[1]);
                }
                
                CC.context.closePath();
                CC.context.stroke();

            }
        }

        //sprite
        if (drawing.sprite && drawing.sprite.url) {

            //limit the sprite with a rectangle
            if (drawing.shape === "rect") {

                CC.context.beginPath();
                CC.context.moveTo(0, 0);
                CC.context.lineTo(FW, 0);
                CC.context.lineTo(FW, FH);
                CC.context.lineTo(0, FH);
                CC.context.closePath();

                CC.context.clip();

            //limit the sprite with a circle
            } else if (drawing.shape === "circle") {

                CC.context.beginPath();

                CC.context.arc(
                    FW / 2, 
                    FW / 2, 
                    FW / 2,
                    0, 2 * Math.PI);

                CC.context.closePath();

                CC.context.clip();

            //limit the sprite with a polygon
            } else if (CC.isArray(drawing.shape)) {

                CC.context.beginPath();
                CC.context.moveTo(drawing.shape[0][0], drawing.shape[0][1]);

                for (var p in drawing.shape) {
                    var point = drawing.shape[p];
                    CC.context.lineTo(point[0], point[1]);
                }
                
                CC.context.closePath();

                CC.context.clip();

            }

            //draw the sprites
            var res = CC.useResource(drawing.sprite.url);
            var spriteX = drawing.sprite.x || 0;
            var spriteY = drawing.sprite.y || 0;
            var spriteW = drawing.sprite.w || Math.min(FW, res.width);
            var spriteH = drawing.sprite.h || Math.min(FH, res.height);
            var startX = 0;
            var startY = 0;
            var repeatX = drawing.sprite.repeat && drawing.sprite.repeat.indexOf("x") != -1;
            var repeatY = drawing.sprite.repeat && drawing.sprite.repeat.indexOf("y") != -1;
            var delay = drawing.sprite.delay || 0;

            if (drawing.sprite.frames) {
                if (drawing.sprite.vertical) {
                    spriteY += (parseInt(CC.step / delay) % drawing.sprite.frames) * spriteH;
                } else {
                    spriteX += (parseInt(CC.step / delay) % drawing.sprite.frames) * spriteW;
                }
            }

            //repeat like a pattern if repeatX or repeatY is true
            do {
                startY = 0;
                do {

                    CC.context.drawImage(res, spriteX, spriteY, spriteW, spriteH, startX, startY, spriteW, spriteH);
                    
                    if (repeatY) {
                        startY += spriteH;
                    }
                } while (startY < EH && repeatY);

                if (repeatX) {
                    startX += spriteW;
                }

            } while (startX < EW && repeatX);
        }

        
        CC.context.restore();

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

    init();

};