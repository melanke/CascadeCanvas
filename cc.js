"use strict";
(function (factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else {
        // Browser globals
        window.CC = factory();
    }
}(function () {

    /**
    * returns a element or a collection of elements that match the string passed as argument
    * @param selector '*' to select all, '#elementId' to select the element by id 'elementId', 
    * 'Class1 Class2' to select elements that contain both classes 'Class1' and 'Class2'
    */
    var CC = function(selector){

        if (selector.indexOf("*") != -1) {
            var asArray = [];
            for (var e in elementMap) {
                asArray.push(elementMap[e]);
            }

            return new ElementList(asArray);
        }

        var id;

        var idArray = selector.match(/#[a-zA-Z0-9]*/);

        if (idArray) {
            id = idArray[0];
        }

        var classes = selector.replace(/#[a-zA-Z0-9]*/, "").split(" ");

        var selecteds = [];

        for (var i in elementMap) {
            var e = elementMap[i];

            if (id && id != e.id) { 
                //if we are selecting by id and it dont have the desired id: pass
                continue;
            }

            var add = true;

            for (var j in classes) {
                var c = classes[j];

                if (c.length && !e.classes[c]) { 
                    //if the element dont have all classes we are looking for: pass
                    add = false;
                    break;

                }
            }

            if (add) {
                selecteds.push(e);
            }

        }

        if (selecteds.length == 1) {
            //if the selection have only one item: return this item
            return selecteds[0];
        }

        //else: return all items as a Collection
        return new ElementList(selecteds);

    };





    var elementMap = {}; //elements stored by id
    var elementsSize = 0;
    var events = {}; //events stored by name
    var running = true;
    var sprites = {}; //sprites loaded stored by url
    var canvas = document.getElementById('CascadeCanvas');
    var keyPressed = {}; //keys pressed
    var keyMapping = {
        8:  "BACKSPACE",

        13: "ENTER",
        16: "SHIFT",
        17: "CTRL",
        18: "ALT",

        20: "CAPSLOCK",

        27: "ESC",

        33: "PGUP",
        34: "PGDOWN",
        35: "END",
        36: "HOME",
        37: "LEFT",
        38: "UP",
        39: "RIGHT",
        40: "DOWN",

        44: "PRINTSCREEN",
        45: "INSERT",

        46: "DEL",

        48: "0",
        49: "1",
        50: "2",
        51: "3",
        52: "4",
        53: "5",
        54: "6",
        55: "7",
        56: "8",
        57: "9",

        65: "A",
        66: "B",
        67: "C",
        68: "D",
        69: "E",
        70: "F",
        71: "G",
        72: "H",
        73: "I",
        74: "J",
        75: "K",
        76: "L",
        77: "M",
        78: "N",
        79: "O",
        80: "P",
        81: "Q",
        82: "R",
        83: "S",
        84: "T",
        85: "U",
        86: "V",
        87: "W",
        88: "X",
        89: "Y",
        90: "Z",

        91: "WIN",

        112: "F1",
        113: "F2",
        114: "F3",
        115: "F4",
        116: "F5",
        117: "F6",
        118: "F7",
        119: "F8",
        120: "F9",
        121: "F10",
        122: "F11",
        123: "F12"
    };

    CC.screen = { x:0, y:0 }; //the area of the screen
    CC.classes = {}; //defined classes expecting to be instantiated
    CC.context = canvas.getContext('2d');
    CC.step = 0; //each loop increments the step, it is used for animation proposes





    canvas.onselectstart = function() { return false; }; //prevent canvas selection
    





    /**
    * creates an element and put it in the canvas
    * @param specs a string where you can specify the id and the classes it inherit, example:
    * '#elementId Class1 Class2' - it will have id: elementId and will inherit Class1 and Class2
    * @opts an object with params that can be used in the class constructor, will affect all inherited classes
    */
    CC.new = function(specs, opts){

        var element = new Element(specs, opts);
        elementMap[element.id ? element.id : elementsSize++] = element;

        return element;
    };

    /**
    * defines a class to be inherited
    * @param classesStr a string with the name of the classes that will have tis behaviour, example:
    * 'Class1 Class2' - those 2 classes will have this behaviour
    * @param constructor a function that will be used as constructor
    */
    CC.def = function(classesStr, constructor){
        var classes = classesStr.split(" ");

        for (var i in classes) {
            var c = classes[i];

            if (c.length) {
                if (!CC.classes[c]) {
                    CC.classes[c] = {
                        constructors: []
                    };
                }

                CC.classes[c].constructors.push(constructor);
            }
        }
    };

    /**
    * erase all information in CascadeCanvas
    */
    CC.clear = function() {

        CC.classes = {};
        elementMap = {};
        elementsSize = 0;
        events = {};

    };

    /**
    * forget about this, you should not use it
    */
    CC.___remove = function(el){

        el.trigger("remove");

        for (var i in elementMap) {
            if (elementMap[i] == el) {
                delete elementMap[i];
            }
        }

    };

    /**
    * check if param is a function
    */
    CC.isFunction = function(functionToCheck){
        return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
    }

    /**
    * check if param is a string
    */
    CC.isString = function(stringToCheck){
        return typeof stringToCheck == 'string' || stringToCheck instanceof String;
    };

    /**
    * check if param is an array
    */
    CC.isArray = function(arrayToCheck){
        return arrayToCheck && {}.toString.call(arrayToCheck) === '[object Array]';
    };

    /**
    * pre-load the image resources used in game
    * @param srcs an array of strings with the path of file
    * @param callback function called when all resources are loaded
    */
    CC.loadResources = function(srcs, callback){
        
        var loadRecursively = function(index) {
            var img = new Image();
            img.src = srcs[index];
            img.onload = function(){

                sprites[srcs[index]] = this;

                if (index < srcs.length - 1) {
                    loadRecursively(index+1);
                } else {
                    callback();
                }

            };
        };

        loadRecursively(0);

    };

    CC.useResource = function(src){
        return sprites[src];
    };

    /**
    * register an action to a global event
    * @param eventsStr a string with the event name and optinally a namespace
    * the namespace is used to trigger, bind or unbind a section of the event
    * use this capability to narrow the scope of our unbinding actions,
    * example: 'eventName.namespace1'
    * @param action a function to be invoked when the event is triggered
    */
    CC.bind = function(eventsStr, action){

        var evtAndNamespace = eventsStr.split(".");
        var evtName = evtAndNamespace[0];
        var namespace = evtAndNamespace[1] || "root";

        if (!events[evtName]) {
            events[evtName] = {};
        }

        if (!events[evtName][namespace]) {
            events[evtName][namespace] = [];
        }

        events[evtName][namespace].push(action);

    };

    /**
    * remove an action to a global event
    * @param eventsStr a string with the event name and optinally a namespace
    * the namespace is used to trigger, bind or unbind a section of the event
    * use this capability to narrow the scope of our unbinding actions,
    * example: 'eventName.namespace1'
    * @param action (optional) if you dont specify the domain you can specify
    * the action you want to remove
    */
    CC.unbind = function(eventsStr, action){

        var evtAndDomain = eventsStr.split(".");
        var evt = evtAndDomain[0];
        var domain = evtAndDomain[1] || "root";

        if (!events[evt]) {
            return;
        }

        if (domain) {
            delete events[evt][domain];
        } else if (action) {
            for (var d in events[evt]) {
                for (var i in events[evt][d]) {
                    if (events[evt][d][i] === action) {
                        events[evt][d].splice(i, 1);
                    }
                }
            }
        } else {
            delete events[evt];
        }

    };

    /**
    * invoke all actions of a global event
    * @param eventsStr a string with the event name and optinally a namespace
    * the namespace is used to trigger, bind or unbind a section of the event
    * use this capability to narrow the scope of our unbinding actions,
    * example: 'eventName.namespace1'
    */
    CC.trigger = function(eventsStr){

        if (!running) {
            return;
        }

        var evtAndDomain = eventsStr.split(".");
        var evt = evtAndDomain[0];
        var domain = evtAndDomain[1] || "root";
        var args = [].splice.call(arguments, 1); //all arguments except the first (eventsStr)

        var callDomain = function(d){
            for (var i in events[evt][d]) {
                events[evt][domain][i].apply(this, args);
            }
        };

        if (events[evt] && events[evt][domain]) {

            if (domain != "root") {
                callDomain(domain);
            } else {
                
                for (var d in events[evt]) {
                    callDomain(d);
                }

            }
        }

    };

    window.addEventListener('keyup', function(event) {
        delete keyPressed[keyMapping[event.keyCode]];
        CC.trigger("keyup", event);
    }, false);

    window.addEventListener('keydown', function(event) {
        keyPressed[keyMapping[event.keyCode]] = true; 
        CC.trigger("keydown", event);
    }, false);

    /**
    * return true if no key is pressed
    */
    CC.isNoKeyPressed = function(){

        for (var j in keyPressed) {
            return false;   
        }

        return true;

    };

    /**
    * detect if all keys in param are pressed
    * @param keys which keys you want to check if are pressed as string separeted by '+'
    * eg.: "Ctrl + Up + A"
    */
    CC.isKeysPressed = function(keys) {
        var keysArr = keys.toUpperCase().replace(/ /g, "").split("+");

        for (var i in keysArr) {
            if (!keyPressed[keysArr[i]]) {
                return false;
            }
        }

        return true;
    };

    /**
    * detect if all and only keys in param are pressed
    * @param keys which keys you want to check if are pressed as string separeted by '+'
    * eg.: "Ctrl + Up + A"
    */
    CC.isKeysPressedOnly = function(keys) {
        var keysArr = keys.toUpperCase().replace(/ /g, "").split("+");
        var map = {};

        for (var i in keysArr) {
            var key = keysArr[i];
            if (!keyPressed[key]) {
                return false;
            }
            map[key] = true;
        }

        for (var j in keyPressed) {
            if (!map[j]) {
                return false;
            }
        }

        return true;
    };

    /**
    * if all keys are down, trigger the action
    * @param keys which keys you want to check if are pressed as string separeted by '+'
    * @param action a function to be invoked when the event is triggered
    */
    CC.onKeysDown = function(keys, action) {
        CC.bind("keydown", function(event){
            if (CC.isKeysPressed(keys)) {
                action(event);
            }
        });
    };

    /**
    * if all and only keys are down, trigger the action
    * @param keys which keys you want to check if are pressed as string separeted by '+'
    * @param action a function to be invoked when the event is triggered
    */
    CC.onKeysDownOnly = function(keys, action) {
        CC.bind("keydown", function(event){
            if (CC.isKeysPressedOnly(keys)) {
                action(event);
            }
        });
    };

    /**
    * if all keys was down, no more keys was down and now one of them is released, trigger the action
    * @param keys which keys you want to check if are pressed as string separeted by '+'
    * @param action a function to be invoked when the event is triggered
    */
    CC.onKeysComboEnd = function(keys, action) {
        CC.bind("keyup", function(event){
            var wantedArr = keys.toUpperCase().replace(/ /g, "").split("+");
            var wantedMap = {};

            for (var i in wantedArr) {
                var wanted = wantedArr[i];
                if (!keyPressed[wanted] && wanted != keyMapping[event.keyCode]) {
                    return;
                }
                wantedMap[wanted] = true;
            }

            if (!wantedMap[keyMapping[event.keyCode]]) {
                return;
            }

            for (var j in keyPressed) {
                if (!wantedMap[j]) {
                    return;
                }
            }

            action(event);
        });
    };

    canvas.onclick = function(event){
        CC.trigger("click", event);
    };

    canvas.oncontextmenu = function (event) { 
        CC.trigger("rightclick", event);
        return false; 
    };

    /**
    * set the center position to focus the drawing
    */
    CC.setScreenCenter = function(x, y) {
        CC.screen.x = (CC.screen.w / 2) - x;
        CC.screen.y = (CC.screen.h / 2) - y;
    };

    /**
    * merge all attributes of the arguments recursively into the first argument and returns it
    */
    CC.merge = function() {

        var mergeRecursively = function(merged, obj){

            if(!merged || !obj) {
                return;
            }

            for (var p in obj) {

                // Property in destination object set; update its value.
                if (obj[p] && obj[p].constructor == Object) {

                    if (!merged[p]) {
                        merged[p] = {};
                    }

                    mergeRecursively(merged[p], obj[p]);

                } else {

                    merged[p] = obj[p];

                }

            }

        };

        for (var i = 1; i < arguments.length; i++) {

            mergeRecursively(arguments[0], arguments[i]);

        }

        return arguments[0];

    };

    /**
    * start the routine of the gameloop, for each loop it triggers 'enterframe' event and render the elements
    */
    CC.startLoop = function(){

        var mainloop = function(){   

            if (!running) {
                return;
            }

            CC.screen.w = canvas.offsetWidth;
            CC.screen.h = canvas.offsetHeight;

            CC.trigger("enterframe");
            draw();
            CC.step++;
        }

        var animFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            null;

        if ( animFrame !== null ) {

            if (navigator.userAgent.indexOf("Firefox") != -1) {
                var recursiveAnim = function() {
                    mainloop();
                    animFrame();
                };

                // setup for multiple calls
                window.addEventListener("MozBeforePaint", recursiveAnim, false);

                // start the mainloop
                animFrame();
            } else {
                var recursiveAnim = function() {
                    mainloop();
                    animFrame(recursiveAnim);
                };

                // start the mainloop
                animFrame(recursiveAnim);
            }
        } else {
            var ONE_FRAME_TIME = 1000.0 / 60.0 ;
            setInterval( mainloop, ONE_FRAME_TIME );
        }

    };

    /**
    * make the triggers and the gameloop to be ignored
    */
    CC.pause = function(){
        running = false;
    };


    /**
    * make the triggers and the gameloop to be considered again
    */
    CC.play = function(){
        running = true;
    };


    /**
    * draw all elements
    */
    var draw = function(){

        CC.context.clearRect(0, 0 , CC.screen.w, CC.screen.h);

        CC("*").sort("zIndex", true).each(function(){

            this.draw();

        });

    };

    /**
    * sort the items of an array by property
    * @param elements array to be sorted
    * @param prop the property to compare
    * @param invert if you want the reverse order
    */
    CC.sort = function(elements, prop, invert){

        if (!CC.isArray(elements)) {
            var asArray = [];
            for (var e in elements) {
                asArray.push(elements[e]);
            }
            elements = asArray;
        }

        return elements.sort(function(a, b){
            if (a[prop] > b[prop]) {
                return invert ? -1 : 1;
            }

            if (a[prop] < b[prop]) {
                return invert ? 1 : -1;
            }

            if (a[prop] == undefined) {
                if (b[prop] < 0) {
                    return invert ? -1 : 1;
                }

                if (b[prop] > 0) {
                    return invert ? 1 : -1;
                }
            }

            if (b[prop] == undefined) {
                if (a[prop] < 0) {
                    return invert ? 1 : -1;
                }

                if (a[prop] > 0) {
                    return invert ? -1 : 1;
                }
            }

            return 0;
        });
    };

    /**
    * rotate a point
    * @param p the point to be rotated
    * @param anchor the anchor point
    * @param angle the angle of the rotation
    */
    CC.rotatePoint = function(p, anchor, angle){

        var px = p.x;
        if (px == undefined) {
            px = p[0];
        }

        var py = p.y;
        if (py == undefined) {
            py = p[1];
        }

        var ax = anchor.x;
        if (ax == undefined) {
            ax = anchor[0];
        }

        var ay = anchor.y;
        if (ay == undefined) {
            ay = anchor[1];
        }

        var teta = angle * Math.PI / 180.0;
        var diffX = px - ax;
        var diffY = py - ay;
        var cos = Math.cos(teta);
        var sin = Math.sin(teta);

        return {
            x: Math.round(cos * diffX - sin * diffY + ax),
            y: Math.round(sin * diffX + cos * diffY + ay)
        };

    };













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
            }

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

                            c.apply(this, [opts]);
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
        */
        this.matches = function(specs){

            var matchesRecursively = function(a, b){

                for (var i in b) {

                    if (!a[i]) {

                        return false;

                    } else if (b[i] && b[i].constructor == Object) {

                        if (matchesRecursively(a[i], b[i]) === false) {
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
        * register an action to an attached event to this element
        * @param eventsStr a string with the event name and optinally a namespace
        * the namespace is used to trigger, bind or unbind a section of the event
        * use this capability to narrow the scope of our unbinding actions,
        * example: 'eventName.namespace1'
        * @param action a function to be invoked when the event is triggered
        */
        this.bind = function(eventsStr, action){

            if (removed) {
                return this;
            }

            var evtAndDomain = eventsStr.split(".");
            var evt = evtAndDomain[0];
            var domain = evtAndDomain[1] || "root";

            if (!thisevents[evt]) {
                thisevents[evt] = {};
            }

            if (!thisevents[evt][domain]) {
                thisevents[evt][domain] = [];
            }

            thisevents[evt][domain].push(action);

            return this;

        };

        /**
        * remove an action attached to this element
        * @param eventsStr a string with the event name and optinally a namespace
        * the namespace is used to trigger, bind or unbind a section of the event
        * use this capability to narrow the scope of our unbinding actions,
        * example: 'eventName.namespace1'
        * @param action (optional) if you dont specify the domain you can specify
        * the action you want to remove
        */
        this.unbind = function(eventsStr, action){

            if (removed) {
                return this;
            }

            var evtAndDomain = eventsStr.split(".");
            var evt = evtAndDomain[0];
            var domain = evtAndDomain[1] || "root";

            if (!thisevents[evt]) {
                return this;
            }

            if (domain) {
                delete thisevents[evt][domain];
            } else if (action) {
                for (var d in thisevents[evt]) {
                    for (var i in thisevents[evt][d]) {
                        if (thisevents[evt][d][i] == action) {
                            thisevents[evt][d].splice(i, 1);
                        }
                    }
                }
            } else {
                delete thisevents[evt];
            }

            return this;

        };


        /**
        * invoke all actions of the event attached to this element
        * @param eventsStr a string with the event name and optinally a namespace
        * the namespace is used to trigger, bind or unbind a section of the event
        * use this capability to narrow the scope of our unbinding actions,
        * example: 'eventName.namespace1'
        */
        this.trigger = function(eventsStr){

            if (removed && eventsStr !== "remove") {
                return this;
            }

            var evtAndDomain = eventsStr.split(".");
            var evt = evtAndDomain[0];
            var domain = evtAndDomain[1] || "root";
            var args = [].splice.call(arguments, 1); //all arguments except the first (eventsStr)

            var callDomain = function(d){
                for (var i in thisevents[evt][d]) {
                    thisevents[evt][domain][i].apply(el, args);
                }
            };

            if (thisevents[evt] && thisevents[evt][domain]) {

                if (domain != "root") {
                    callDomain(domain);
                } else {
                    
                    for (var d in thisevents[evt]) {
                        callDomain(d);
                    }

                }
            }

            return this;

        };

        /**
        * trigger the action when the elements match the specs
        */
        this.became = function(specs, action){

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

            CC.bind("click", function(event){
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
            //TODO: gradientRadial
            //TODO: mensuration with percentage and sum of pixels eg.: "80% + 10" (percentage is based on width/height of drawing/elemento)
            //TODO: effects (transparency, blur, others)
            //TODO: round borders using quadranticCurveTo for rect shapes
            //   http://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
            //TODO: toggleDrawings, tweenDrawings
            //TODO: more mouse events and better accuracy for click on element

            if (!drawing || drawing.hidden === true) {
                return;
            }

            //defining a Width and Height of an element without width and height based on the shape polygon points
            var W = el.w;
            var H = el.h;
            if (CC.isArray(drawing.shape) && (!el.w || !el.h)) {
                W = el.w || 0;
                H = el.h || 0;
                for (var i in drawing.shape) {
                    W = Math.max(W, drawing.shape[i][0]);
                    H = Math.max(H, drawing.shape[i][1]);
                }
            }

            var offsetW = drawing.offsetW || 0,
                offsetH = drawing.offsetH || 0,
                offsetX = drawing.offsetX || 0,
                offsetY = drawing.offsetY || 0;

            //dont draw if it isn't in screen range
            if (el.x + offsetX + offsetW + W < CC.screen.x
            || el.x - offsetX - offsetW - W > CC.screen.x + CC.screen.w
            || el.y + offsetY + offsetH + H < CC.screen.y
            || el.y - offsetY - offsetH - H > CC.screen.y + CC.screen.h) {
                return;
            }

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
                        x: W / 2,
                        y: H / 2
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
                        x: W / 2,
                        y: H / 2
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
                offsetX - (offsetW / 2), 
                offsetY - (offsetH / 2)
            );

            //flipping the element
            if (el.flip && el.flip.length) {
                var scaleHor = el.flip.indexOf("x") != -1 ? -1 : 1;
                var scaleVer = el.flip.indexOf("y") != -1 ? -1 : 1;

                //translate to the center
                CC.context.translate((W + offsetW)/2, (H + offsetH)/2);
                //scale
                CC.context.scale(scaleHor, scaleVer);
                //translate back to 0, 0
                CC.context.translate(-(W + offsetW)/2, -(H + offsetH)/2);
            }

            //flipping the drawing
            if (drawing.flip && drawing.flip.length) {
                var scaleHor = drawing.flip.indexOf("x") != -1 ? -1 : 1;
                var scaleVer = drawing.flip.indexOf("y") != -1 ? -1 : 1;

                //translate to the center
                CC.context.translate((W + offsetW)/2, (H + offsetH)/2);
                //scale
                CC.context.scale(scaleHor, scaleVer);
                //translate back to 0, 0
                CC.context.translate(-(W + offsetW)/2, -(H + offsetH)/2);
            }

            //scale - if want to stretch or squeeze the drawing
            if (drawing.scale && (drawing.scale.x || drawing.scale.y)) {

                //translate to the center
                CC.context.translate((W + offsetW)/2, (H + offsetH)/2);
                //scale
                CC.context.scale(drawing.scale.x || 1, drawing.scale.y || 1);
                //translate back to 0, 0
                CC.context.translate(-(W + offsetW)/2, -(H + offsetH)/2);
            }

            //fill
            if (drawing.fill) {

                //by color
                if (drawing.fill.color && CC.isString(drawing.fill.color)) {

                    CC.context.fillStyle = drawing.fill.color;

                //by linear gradient
                } else if (drawing.fill.linearGradient) {

                    CC.context.fillStyle = createLinearGradient(drawing.fill.linearGradient, drawing, W, H);
                    
                }

                //draw a rectangle
                if (drawing.shape === "rect") {

                    CC.context.fillRect(0, 0, W + offsetW, H + offsetH);

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

                    CC.context.strokeStyle = createLinearGradient(drawing.stroke.linearGradient, drawing, W, H);
                    
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

                    CC.context.strokeRect(0, 0, W + offsetW, H + offsetH);

                //draw a circle
                } else if (drawing.shape === "circle") {

                    CC.context.beginPath();

                    CC.context.arc(
                        (W + offsetW) / 2, 
                        (W + offsetW) / 2, 
                        (W + offsetW) / 2,
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
                    CC.context.lineTo(W + offsetW, 0);
                    CC.context.lineTo(W + offsetW, H + offsetH);
                    CC.context.lineTo(0, H + offsetH);
                    CC.context.closePath();

                    CC.context.clip();

                //limit the sprite with a circle
                } else if (drawing.shape === "circle") {

                    CC.context.beginPath();

                    CC.context.arc(
                        (W + offsetW) / 2, 
                        (W + offsetW) / 2, 
                        (W + offsetW) / 2,
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
                var spriteW = drawing.sprite.w || Math.min(W + offsetW, res.width);
                var spriteH = drawing.sprite.h || Math.min(H + offsetH, res.height);
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
                    } while (startY < H && repeatY);

                    if (repeatX) {
                        startX += spriteW;
                    }

                } while (startX < W && repeatX);
            }

            
            CC.context.restore();

        };

        var createLinearGradient = function(linearGradient, drawing, W, H){
            var offsetW = drawing.offsetW || 0,
                offsetH = drawing.offsetH || 0;

            if (!linearGradient.start) {
                linearGradient.start = [0, 0];
            }

            if (!linearGradient.end) {
                linearGradient.end = [100, 0];
            }

            var x1 = linearGradient.start[0] / 100 * (W + offsetW);
            var y1 = linearGradient.start[1] / 100 * (H + offsetH);
            var x2 = linearGradient.end[0] / 100 * (W + offsetW);
            var y2 = linearGradient.end[1] / 100 * (H + offsetH);

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














    /**
    * a collection of elements
    */
    var ElementList = function(elements, selection){

        this.selection = selection;

        /**
        * invoke an action for all elements selected
        */
        this.each = function(action){

            for (var i in elements) {

                action.call(elements[i]);

            }

            return this;

        };

        /**
        * get an element by the index
        */
        this.eg = function(index){
            return elements[index];
        };

        /**
        * returns a copy of the elements as array
        */
        this.asArray = function(){
            return elements.slice(0);
        };

        this.inherit = function(classesStr, opts){

            this.each(function(){
                this.inherit(classesStr, opts);
            });

            return this;

        };

        /**
        * autosort the collection by the attribute
        */
        this.sort = function(prop, invert){

            elements = CC.sort(elements, prop, invert);

            return this;

        };

        /**
        * search for an element on the collection with the attributes specified in the parameter
        */
        this.search = function(atrs){
            
            var result = [];

            this.each(function(){
                var thisSearch = this.matches(atrs);

                if (thisSearch) {

                    result.push(this);

                }
            });

            return new ElementList(result, selection + "\n" + JSON.parse(atrs) + "\n\n");

        };

        this.merge = function(obj){

            this.each(function(){
                this.merge(obj);
            });

            return this;

        };

        this.remove = function(){

            this.each(function(){
                this.remove();
            });

        };

        this.bind = function(eventsStr, action){

            this.each(function(){
                this.bind(eventsStr, action);
            });

            return this;

        };

        this.unbind = function(eventsStr, action){

            this.each(function(){
                this.unbind(eventsStr, action);
            });

            return this;

        };

        this.trigger = function(){

            this.each(function(){
                this.trigger.apply(this, arguments);
            });

            return this;

        };

        this.became = function(specs, action){

            var el = this;

            return CC.bind("enterframe", function(){

                el.each(function(){
                    var thisSearch = this.matches(atrs);

                    if (thisSearch) {

                        action.call(this);

                    }
                });
            });

        };

    };

    return CC;

}));