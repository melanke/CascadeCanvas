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





    CC.classes = {}; //defined classes expecting to be instantiated
    var elementMap = {}; //elements stored by id
    var elementsSize = 0;
    var events = {}; //events stored by name
    var running = true;
    var canvas = document.getElementById('CascadeCanvas');
    CC.context = canvas.getContext('2d');
    CC.screen = {}; //the area of the screen


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
    CC.___remove = function(obj){

        for (var i in elementMap) {
            if (elementMap[i] == this) {
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
    }

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

        var callDomain = function(d){
            for (var i in events[evt][d]) {
                events[evt][domain][i]();
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

            if (removed) {
                return this;
            }

            var evtAndDomain = eventsStr.split(".");
            var evt = evtAndDomain[0];
            var domain = evtAndDomain[1] || "root";

            var callDomain = function(d){
                for (var i in thisevents[evt][d]) {
                    thisevents[evt][domain][i].call(el);
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
        * draw in the default way and draw the customizations in the queue
        */
        this.draw = function(){

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
        *       zIndex: 3, //the less zIndex is most visible it is (in the front of other drawings)
        *       offsetX: 10, //drawing will be 10 to the right
        *       offsetY: 10, //10 to the bottom
        *       offsetW: 10, //10 wider, 5 to each side
        *       offsetH: 10, //10 taller, 5 to each side
        *       angle: 30, //rotated 30 degrees
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
        *               start: [0, 0],
        *               end: [100, 100],
        *               "0": "rgba(200, 100, 100, 0.8)",
        *               "0.5": "#f00",
        *               "1": "#0000dd"
        *           }
        *       }
        * }
        */
        var drawShape = function(drawing){
            //TODO: medidas com porcentagem e soma de pixels ex.: "80% + 10" (porcentagem é baseada na width/height do drawing/elemento)
            //TODO: gradientRadial; images; animation; shape; effects (transparency, blur, others)

            if (!drawing) {
                return;
            }

            var offsetX = drawing.offsetX || 0,
                offsetY = drawing.offsetY || 0,
                offsetW = drawing.offsetW || 0,
                offsetH = drawing.offsetH || 0;

            CC.context.save();

            CC.context.translate(el.x, el.y);

            if (el.angle) { //element rotation

                if (!el.anchor) {
                    el.anchor = {
                        x: el.w / 2,
                        y: el.h / 2
                    };
                }
 
                CC.context.translate(el.anchor.x, el.anchor.y);
                CC.context.rotate(-el.angle * Math.PI/180);
                CC.context.translate(-el.anchor.x, -el.anchor.y);
            }

            if (drawing.angle) { //drawing rotation

                if (!drawing.anchor) {
                    drawing.anchor = el.anchor || {
                        x: el.w / 2,
                        y: el.h / 2
                    };
                }
 
                CC.context.translate(drawing.anchor.x, drawing.anchor.y);
                CC.context.rotate(-drawing.angle * Math.PI/180);
                CC.context.translate(-drawing.anchor.x, -drawing.anchor.y);
            }

            if (drawing.stroke) {

                if (drawing.stroke.color && CC.isString(drawing.stroke.color)) { //stroke color

                    CC.context.strokeStyle = drawing.stroke.color;

                } else if (drawing.stroke.linearGradient) { //stroke linear gradient

                    CC.context.strokeStyle = createLinearGradient(drawing.stroke.linearGradient, drawing);
                    
                }

                if (drawing.stroke.thickness) { //stroke thickness
                    CC.context.lineWidth = drawing.stroke.thickness;
                }

                if (drawing.stroke.cap) { //stroke end style - 'butt','round' OR 'square'
                    CC.context.lineCap = drawing.stroke.cap;
                }

                if (drawing.stroke.join) { //stroke curve style - 'round','bevel' OR 'miter'
                    CC.context.lineJoin = drawing.stroke.join;
                }

                CC.context.strokeRect(offsetX - (offsetW/2), offsetY - (offsetH/2), el.w + offsetW, el.h + offsetH);
            }

            if (drawing.fill) {

                if (drawing.fill.color && CC.isString(drawing.fill.color)) { //fill color

                    CC.context.fillStyle = drawing.fill.color;

                } else if (drawing.fill.linearGradient) { //fill linear gradient

                    CC.context.fillStyle = createLinearGradient(drawing.fill.linearGradient, drawing);
                    
                }

                CC.context.fillRect(offsetX - (offsetW/2), offsetY - (offsetH/2), el.w + offsetW, el.h + offsetH);
            }

            
            CC.context.restore();

        };

        var createLinearGradient = function(linearGradient, drawing){
            var offsetX = drawing.offsetX || 0,
                offsetY = drawing.offsetY || 0,
                offsetW = drawing.offsetW || 0,
                offsetH = drawing.offsetH || 0;

            if (!linearGradient.start) {
                linearGradient.start = [0, 0];
            }

            if (!linearGradient.end) {
                linearGradient.end = [100, 0];
            }

            var x1 = offsetX - (offsetW/2) + (linearGradient.start[0] / 100 * (el.w + offsetW));
            var y1 = offsetY - (offsetH/2) + (linearGradient.start[1] / 100 * (el.h + offsetH));
            var x2 = offsetX - (offsetW/2) + (linearGradient.end[0] / 100 * (el.w + offsetW));
            var y2 = offsetY - (offsetH/2) + (linearGradient.end[1] / 100 * (el.h + offsetH));

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

        this.trigger = function(eventsStr){

            this.each(function(){
                this.trigger(eventsStr);
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