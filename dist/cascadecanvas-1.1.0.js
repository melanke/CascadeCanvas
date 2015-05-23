/**
 * Cascade Canvas - MIT
 * https://github.com/CascadeCanvas/CascadeCanvas
 */
 (function (factory) {
    "use strict";
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




/***** CORE *****/

//depends on element and elementlist
//is dependency of all classes

var CC;

(function(){
    
    var elementMap = {}, //elements stored by id
        elementsSize = 0,
        lazyElements = [], //used to find elements of area faster
        notLazyElements = [], //elements that will be searched everytime
        chunkSize = 800; //size of the chunk of area search




    /**
    * returns a collection of elements that match the string passed as argument
    * @param selector '*' to select all, '#elementId' to select the element by id 'elementId', 
    * 'Class1 Class2' to select elements that contain both classes 'Class1' and 'Class2'
    */
    CC = function(selector){

        if (selector.indexOf("*") != -1) {
            var asArray = [];
            for (var e in elementMap) {
                asArray.push(elementMap[e]);
            }

            return new ElementList(asArray, selector);
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

        //else: return all items as a Collection
        return new ElementList(selecteds, selector);

    };



    CC.classes = {}; //defined classes expecting to be instantiated




    /**
    * creates an element and put it in the canvas
    * @param specs a string where you can specify the id and the classes it inherit, example:
    * '#elementId Class1 Class2' - it will have id: elementId and will inherit Class1 and Class2
    * @opts an object with params that can be used in the class constructor, will affect all inherited classes
    */
    CC.new = function(specs, opts){

        if (opts && opts.lazy === true && opts.fixedOnScreen) {
            delete opts.lazy;
            console && console.warn("fixedOnScreen elements should not be lazy!");
        }

        var element = new Element(specs, opts);
        elementMap[element.id ? element.id : elementsSize++] = element;

        if (opts && opts.lazy === true && element.x !== undefined && element.y !== undefined) {
            var cX = parseInt(element.x / chunkSize);
            var cY = parseInt(element.y / chunkSize);

            if (!lazyElements[cX]) {
                lazyElements[cX] = [];
            }

            if (!lazyElements[cX][cY]) {
                lazyElements[cX][cY] = [];
            }

            lazyElements[cX][cY].push(element);
        } else {
            notLazyElements.push(element);
        }

        return element;
    };

    /**
    * defines a class to be inherited
    * @param classesStr a string with the name of the classes that will have tis behaviour, example:
    * 'Class1 Class2' - those 2 classes will have this behaviour
    * @param constructor a function that will be used as constructor
    */
    CC.def = function(classesStr, constructor){
        if (!CC.isString(classesStr) || !CC.isFunction(constructor)) {
            return;
        }

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
        lazyElements = [];
        notLazyElements = [];
        CC.clearEvents();

    };

    /**
    * removes an element
    */
    CC.remove = function(el){

        el.trigger("remove");

        for (var i in elementMap) {
            if (elementMap[i] == el) {
                delete elementMap[i];
            }
        }

        for (var j in notLazyElements) {
            if (notLazyElements[j] == el) {
                delete notLazyElements[j];
            }
        }

        var cX = parseInt(el.x / chunkSize);
        var cY = parseInt(el.y / chunkSize);   

        if (lazyElements[cX] && lazyElements[cX][cY]) {
            for (var k in lazyElements) {
                if (lazyElements[cX][cY][k] == el) {
                    delete lazyElements[cX][cY][k];
                }
            }
        }     

    };

    CC.areaSearch = function(area) {

        if (area == null || area.x === undefined || area.y === undefined || area.w === undefined || area.h == undefined) {
            return null;
        }

        var selecteds = [];

        //LAZY ELEMENTS
        var fromCX = parseInt(area.x / chunkSize) -1;
        var fromCY = parseInt(area.y / chunkSize) -1;
        var toCX = parseInt((area.x + area.w) / chunkSize) +1;
        var toCY = parseInt((area.y + area.h) / chunkSize) +1;
        
        for (var cX = fromCX; cX <= toCX; cX++) {
            for (var cY = fromCY; cY <= toCY; cY++) {
                if (lazyElements[cX] && lazyElements[cX][cY]) {
                    var c = lazyElements[cX][cY];

                    populateElementsInsideArea(c, selecteds, area);
                }
            }
        }

        //NOT LAZY
        populateElementsInsideArea(notLazyElements, selecteds, area);

        return new ElementList(selecteds, "area: "+JSON.stringify(area));

    };

    var populateElementsInsideArea = function(from, to, area) {

        for (var i in from) {
            var el = from[i];

            if (area.includeFixedOnScreen)
            { 
                if (area.includeFixedOnScreen === el.fixedOnScreen) {
                    to.push(el);
                    continue;
                } else if (el.fixedOnScreen){
                    continue;
                }

            }

            var w = el.w || 0;
            var h = el.h || 0;
            
            if (!(el.x > area.x + area.w || 
                   el.x + w < area.x || 
                   el.y > area.y + area.h ||
                   el.y + h < area.y))
            {
                to.push(el);
            }
        }

    };

    CC.level = function(description, startX, startY, tileW, tileH) {

        if (CC.isObject(description)) {

            for (var specs in description) {
                var optsArr = description[specs];

                for (var i in optsArr) {
                    CC.new(specs, optsArr[i]);
                }
            }

        } else if (CC.isArray(description)) {
            
            if (startX === undefined
             || startY === undefined
              || tileW === undefined
              || tileH === undefined)
            {
                return;
            }

            var y = startY;
            for (var l in description) {
                var line = description[l];
                var x = startX;

                for (var i in line) {

                    CC.new(line[i], {
                        x: x,
                        y: y,
                        w: tileW,
                        h: tileH
                    });

                    x += tileW;
                }

                y += tileH;
            }

        }

    };

})();




/***** EVENT *****/

//have no dependency
//is dependency of element, loop, keyboard, mouse, promise

/**
* builds an enviroment for event handling (internal use)
*/
var eventEnvironmentBuilder = function(owner, shouldTrigger){

    var events = [];

    /**
    * register an action to a global event
    * @param eventsStr a string with the event name and optinally a namespace
    * the namespace is used to trigger, bind or unbind a section of the event
    * use this capability to narrow the scope of our unbinding actions,
    * example: 'eventName.namespace1'
    * @param action a function to be invoked when the event is triggered
    */
    owner.bind = function(eventsStr, action){

        var evtAndNamespace = eventsStr.split(".");
        var evtName = evtAndNamespace[0];
        var namespace = evtAndNamespace[1] || "root";

        if (evtName && evtName.length) {

            if (!events[evtName]) {
                events[evtName] = {};
            }

            if (!events[evtName][namespace]) {
                events[evtName][namespace] = [];
            }

            if (action) {
                events[evtName][namespace].push(action);
            }
        }

        return {
            unbind: function(){
                owner.unbind(eventsStr, action);
            }
        };

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
    owner.unbind = function(eventsStr, action){

        var evtAndNamespace = eventsStr.split(".");
        var evtName = evtAndNamespace[0];
        var namespace = evtAndNamespace[1] || "root";

        if (evtName && evtName.length) {
            if (namespace != "root") {
                if (action) {
                    //evtName, namespace, action
                    if (events[evtName] && events[evtName][namespace]) {
                        for (var i in events[evtName][namespace]) {
                            if (events[evtName][namespace][i] === action) {
                                events[evtName][namespace].splice(i, 1);
                            }
                        }
                    }

                } else {
                    //evtName, namespace, no action
                    if (events[evtName]) {
                        delete events[evtName][namespace];
                    }
                }
            } else if (action) {
                //evtName, no namespace, action
                for (var i in events[evtName]) {
                    
                    for (var j in events[evtName][i]) {
                        if (events[evtName][i][j] === action) {
                            events[evtName][i].splice(j, 1);
                        }
                    }
                    
                }
            } else {
                //evtName, no namespace, no action
                delete events[evtName];
            }
        } else if (namespace != "root") {
            if (action) {
                //no evtName, namespace, action
                for (var i in events) {
                
                    for (var j in events[i][namespace]) {
                        if (events[i][namespace][j] === action) {
                            events[i][namespace].splice(j, 1);
                        }
                    }
                    
                }

            } else {
                //no evtName, namespace, no action
                for (var i in events) {
                    delete events[i][namespace];
                }
            }
        }

    };

    /**
    * invoke all actions of a global event
    * @param eventsStr a string with the event name and optinally a namespace
    * the namespace is used to trigger, bind or unbind a section of the event
    * use this capability to narrow the scope of our unbinding actions,
    * example: 'eventName.namespace1'
    */
    owner.trigger = function(eventsStr){

        if (shouldTrigger && !shouldTrigger()) {
            return;
        }

        var evtAndNamespace = eventsStr.split(".");
        var evtName = evtAndNamespace[0];
        var namespace = evtAndNamespace[1] || "root";

        var args = [].splice.call(arguments, 1); //all arguments except the first (eventsStr)

        var callNamespace = function(n){
            var e = events[evtName][n];

            for (var i in e) {
                e[i].apply(owner, args);
            }
        };

        if (events[evtName]) {

            if (namespace == "root") {
                for (var d in events[evtName]) {
                    callNamespace(d);
                }
            } else if (events[evtName] && events[evtName][namespace]) {
                callNamespace(namespace);
            }   
            
        }
        

    };

    owner.clearEvents = function(){
        events = [];
    };

};

eventEnvironmentBuilder(CC);




/***** TYPE CHECKER *****/

//have no dependency
//is dependency of objectTools, element, promise

(function(){

    /**
    * check if param is a function
    */
    CC.isFunction = function(functionToCheck){
        return functionToCheck != null && {}.toString.call(functionToCheck) === '[object Function]';
    }

    /**
    * check if param is a string
    */
    CC.isString = function(stringToCheck){
        return typeof stringToCheck == 'string' || stringToCheck instanceof String;
    };

    /**
    * check if param is a number
    */
    CC.isNumber = function(numberToCheck) {
    	return !isNaN(parseFloat(numberToCheck)) && isFinite(numberToCheck);
    };

    /**
    * check if param is an array
    */
    CC.isArray = function(arrayToCheck){
        return arrayToCheck != null && {}.toString.call(arrayToCheck) === '[object Array]';
    };

    /**
    * check if param is an object and not a function, string or array
    */
    CC.isObject = function(objectToCheck){
        return objectToCheck != null 
        && typeof objectToCheck === 'object' 
        && !CC.isFunction(objectToCheck) 
        && !CC.isString(objectToCheck)
        && !CC.isNumber(objectToCheck)
        && !CC.isArray(objectToCheck);
    };

})();




/***** OBJECT TOOLS *****/

//depends on typeChecker
//is dependency of element, elementlist

(function(){

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
                if (CC.isObject(obj[p])) {

                    if (!merged[p] || !CC.isObject(merged[p])) {
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
    * sort the items of an array by properties and order
    */
    CC.sort = function(){

        if (arguments.length < 2)
        {
            return;
        }

        var elements = arguments[0];

        var props = [].splice.call(arguments, 1); //all arguments except the first (elements)

        if (!CC.isArray(elements)) {

            if (!CC.isObject(elements))
            {
                return elements;
            }

            var asArray = [];
            for (var e in elements) {
                asArray.push(elements[e]);
            }
            elements = asArray;
        }

        if (!CC.isArray(props[0]) || props[0].length < 2)
        {
            return elements;
        }

        var sortOrderChecker = function(a, b, index){
            var prop = props[index][0];
            var order = props[index][1];

            var aprop = a[prop];
            var bprop = b[prop];

            if (CC.isFunction(aprop)) {
                aprop = aprop.call(a);
            }

            if (CC.isFunction(bprop)) {
                bprop = bprop.call(b);
            }

            if (aprop == bprop) {
                var nextIndex = index +1;
                if (props.length > nextIndex && props[nextIndex].length > 1) {
                    return sortOrderChecker(a, b, nextIndex);
                } else {
                    return 0;
                }
            }

            if (aprop > bprop) {
                return order !== "ASC" ? -1 : 1;
            }

            if (aprop < bprop) {
                return order !== "ASC" ? 1 : -1;
            }

            if (aprop == undefined) {
                if (bprop < 0) {
                    return order !== "ASC" ? -1 : 1;
                }

                if (bprop > 0) {
                    return order !== "ASC" ? 1 : -1;
                }
            }

            if (bprop == undefined) {
                if (aprop < 0) {
                    return order !== "ASC" ? 1 : -1;
                }

                if (aprop > 0) {
                    return order !== "ASC" ? -1 : 1;
                }
            }

            return 0;
        };

        return elements.sort(function(a, b){
            return sortOrderChecker(a, b, 0);
        });
    };

})();




/***** MATH *****/

//doesnt have any dependency
//is dependency of mouse

(function(){

    /**
    * normalize the point, if it is an array transform it in an object
    */
    CC.normalizePoint = function(p) {
        var result = {
            x: p.x,
            y: p.y
        };

        if (result.x == undefined && p.length > 1)
        {
            result.x = p[0];
        }

        if (result.y == undefined && p.length > 1)
        {
            result.y = p[1];
        }

        return result;
    };

    /**
    * rotate a point
    * @param p the point to be rotated
    * @param anchor the anchor point
    * @param angle the angle of the rotation
    */
    CC.rotatePoint = function(p, anchor, angle){

        p = CC.normalizePoint(p);
        anchor = CC.normalizePoint(anchor);

        var teta = angle * Math.PI / -180.0;
        var diffX = p.x - anchor.x;
        var diffY = p.y - anchor.y;
        var cos = Math.cos(teta);
        var sin = Math.sin(teta);

        return {
            x: Math.round(cos * diffX - sin * diffY + anchor.x),
            y: Math.round(sin * diffX + cos * diffY + anchor.y)
        };

    };


    
    /** 
    * calculates the distance between two points
    */
    
    CC.calcDistance = function(p1, p2) {

        p1 = CC.normalizePoint(p1);
        p2 = CC.normalizePoint(p2);

        var xs = 0;
        var ys = 0;

        xs = p2.x - p1.x;
        xs = xs * xs;

        ys = p2.y - p1.y;
        ys = ys * ys;

        return Math.sqrt(xs + ys);

    };

    /**
    * calculates the angle in a line of two points in radians
    */
    CC.calcAngleRadians = function(p1, p2) {

        p1 = CC.normalizePoint(p1);
        p2 = CC.normalizePoint(p2);

        return Math.atan2(p2.y - p1.y, p2.x - p1.x);

    };

    /**
    * calculates the angle in a line of two points in radians
    */
    CC.calcAngleDegrees = function(p1, p2) {

        return CC.calcAngleRadians(p1, p2) * -180 / Math.PI;

    };

    CC.generalFormEqOfLine = function (p1, p2){
        var p1 = CC.normalizePoint(p1);
        var p2 = CC.normalizePoint(p2);

        return {
            a: p1.y - p2.y,
            b: p2.x - p1.x,
            c: (p1.x - p2.x) * p1.y + (p2.y - p1.y) * p1.x
        };
    };

    CC.calcLineDistance = function(line, p) {
        p = CC.normalizePoint(p);

        return Math.abs(line.a * p.x + line.b * p.y + line.c) / Math.sqrt(line.a * line.a + line.b * line.b);
    };

    CC.calcCenterOfPoints = function(points) {

        var minX = Number.MAX_VALUE;
        var minY = Number.MAX_VALUE;
        var maxX = Number.MIN_VALUE;
        var maxY = Number.MIN_VALUE;

        for (var i in points) {
            var p = CC.normalizePoint(points[i]);

            minX = Math.min(minX, p.x);
            minY = Math.min(minY, p.y);
            maxX = Math.max(maxX, p.x);
            maxY = Math.max(maxY, p.y);
        }

        return {
            x: minX + ((maxX - minX) / 2),
            y: minY + ((maxY - minY) / 2)
        }

    };

})();




/***** PROMISE *****/

//depends on event, typeChecker
//is dependency of ajax

(function(){

    CC.Promise = function() {
        this._callbacks = [];
    };

    CC.Promise.prototype.then = function(func, context) {
        
        var p;

        if (this._isdone) {
            p = func.apply(context, this.result);
        } else {

            p = new CC.Promise();

            this._callbacks.push(function () {
                
                var res = func.apply(context, arguments);
                
                if (res && CC.isFunction(res.then)) {
                    res.then(p.done, p);
                }
                
            });
        }

        return p;
    };

    CC.Promise.prototype.done = function() {
        
        this.result = arguments;
        this._isdone = true;

        for (var i = 0; i < this._callbacks.length; i++) {
            this._callbacks[i].apply(null, arguments);
        }

        this._callbacks = [];
    };

    CC.when = function(eventsStr){

        var p = new CC.Promise();

        var cb = function(){
            p.done.apply(p, arguments);
            CC.unbind(eventsStr, cb);
        };

        CC.bind(eventsStr, cb);

        return p;

    };

    CC.promiseJoin = function(promises) {

        var p = new CC.Promise();
        var total = promises.length;
        var numdone = 0;
        var results = [];

        var notifier = function(i) {
            return function() {
                numdone += 1;
                results[i] = Array.prototype.slice.call(arguments);
                
                if (numdone === total) {
                    p.done.apply(p, results);
                }
            };
        }

        for (var i = 0; i < total; i++) {
            promises[i].then(notifier(i));
        }

        return p;
    };

    CC.promiseChain = function(funcs, args) {
        
        var p = new CC.Promise();
        
        if (funcs.length === 0) {
            p.done.apply(p, args);
        } else {

            var pi = funcs[0].apply(null, args);

            if (pi && CC.isFunction(pi.then)) {

                pi.then(function() {
                    
                    funcs.splice(0, 1);
                    
                    CC.promiseChain(funcs, arguments).then(function() {
                        p.done.apply(p, arguments);
                    });
                });

            }
        }
        return p;
    };

})();





/***** MOUSE *****/



var mouseEnvironmentBuilder = function(canvas, screen) {

    var mouseHistory = []; //current mouse interaction, movement while it is pressed
    var touchHistory = {}; //current finger interaction, movement while it is touching (separated by an identifier)
    var fingersPositionWhenFingerAmountChange = {};
    var currentFingerCount = 0;
    var lastClickOrTapTime = 0;

    var longPressOrClickTimeout = 1000; //1 second
    var longPressTimeout = null;
    var tapOrClickDistance = 32; //32 px
    var swipeMinSpeed = 0.5;
    var swipeMinDistance = 200;
    var swipeMaxDeviation = 100;
    var doubleClickOrTapTime = 200;

    /******** SIMPLE EVENTS ********/

    canvas.onselectstart = function() { 
    	return false; 
    };

    canvas.onmousedown = function(event){
        event.screen = screen;
        CC.trigger("mousedown", event);
    };

    canvas.onmouseup = function(event){
        event.screen = screen;
        CC.trigger("mouseup", event);
    };

    canvas.onmousemove = function(event){
        event.screen = screen;
        CC.trigger("mousemove", event);
    };

    canvas.oncontextmenu = function (event) { 
    	event.screen = screen;
        CC.trigger("rightclick", event); 
        return false; 
    };

    canvas.addEventListener("touchstart", function(event) {
        event.preventDefault();
        event.screen = screen;
        CC.trigger("touchstart", event);
    }, false);

    canvas.addEventListener("touchend", function(event) {
        event.preventDefault();
        event.screen = screen;
        CC.trigger("touchend", event);
    }, false);

    canvas.addEventListener("touchmove", function(event) {
        event.preventDefault();
        event.screen = screen;
        CC.trigger("touchmove", event);
    }, false);


    /********** COMPLEX EVENTS ***********/

    CC.bind("mousedown", function(event){

        mouseHistory.push({
            type: "start",
            x: event.offsetX,
            y: event.offsetY,
            when: new Date().getTime()
        });

        identifyAndTriggerLongClickOrPress(true, mouseHistory, event);

    });

    CC.bind("mousemove", function(event){
        
        if (mouseHistory.length) {
            CC.trigger("mousedrag", event);

            mouseHistory.push({
                type: "move",
                x: event.offsetX,
                y: event.offsetY,
                when: new Date().getTime()
            });
        }
    });

    CC.bind("mouseup", function(event){

        for (var a in mouseHistory) {
            if (mouseHistory[a].type === "move") {
                CC.trigger("mousedragend", event);
                break;
            }
        }

        identifyAndTriggerClickOrTap(true, mouseHistory, event);

        clearHistory(mouseHistory);
        clearTimeout(longPressTimeout);
    });



    CC.bind("touchstart", function(event){

        var touches = event.changedTouches;

        for (var i = 0; i < touches.length; i++) {

            currentFingerCount++;

            var touch = touches[i];

            if (!touchHistory[touch.identifier]) {
                touchHistory[touch.identifier] = [];
            }

            touchHistory[touch.identifier].push({
                type: "start",
                x: touch.pageX,
                y: touch.pageY,
                when: new Date().getTime()
            });

            //register the current position of all fingers touching
            fingersPositionWhenFingerAmountChange = {};
            for (var i in touchHistory) {
                fingersPositionWhenFingerAmountChange[i] = touchHistory[i][touchHistory[i].length-1];
            }
        }

        if (!touches.length)
        {
            identifyAndTriggerLongClickOrPress(false, touchHistory[touches[0].identifier], event);
        }

    });

    CC.bind("touchmove", function(event){

        var touches = event.changedTouches;

        for (var i = 0; i < touches.length; i++) {
            var touch = touches[i];

            if (touchHistory[touch.identifier] 
                && touchHistory[touch.identifier].length) 
            {
                touchHistory[touch.identifier].push({
                    type: "move",
                    x: touch.pageX,
                    y: touch.pageY,
                    when: new Date().getTime()
                });
            }

        }
    });

    CC.bind("touchend", function(event){

        var touches = event.changedTouches;

        if (touches.length)
        {

            for (var i = 0; i < touches.length; i++) {
                currentFingerCount--;

                var touch = touches[i];

                if (currentFingerCount == 0) {
                    identifyAndTriggerClickOrTap(false, touchHistory[touch.identifier], event);
                }

                clearHistory(touchHistory[touch.identifier]);
                delete touchHistory[touch.identifier];
                clearTimeout(longPressTimeout);

                //register the current position of all fingers touching
                fingersPositionWhenFingerAmountChange = {};
                for (var i in touchHistory) {
                    fingersPositionWhenFingerAmountChange[i] = touchHistory[i][touchHistory[i].length-1];
                }

            }
        }
    });

    /******** IDENTIFY GESTURES ***********/

    CC.identifyMouseSwipe = function() {
        return identifySwipe(true, mouseHistory);
    };

    CC.identifyTouchSwipe = function() {

        var uniqueItem = null;
        //getting the unique item in touchHistory (or null)
        for (var a in touchHistory) {
            if (!uniqueItem) {
                uniqueItem = a;
            } else {
                uniqueItem = null;
                break;
            }
        }

        if (!uniqueItem)
        {
            return null;
        }

        return identifySwipe(false, uniqueItem);
    };

    CC.identifyTouchPinchOrSpread = function() {

        if (currentFingerCount < 2) {
            return null;
        }

        var actualPositions = {};
        for (var i in touchHistory) {
            actualPositions[i] = touchHistory[i][touchHistory[i].length-1];
        }

        var actualDistanceSum = distanceSum(actualPositions);
        var firstDistanceSum = distanceSum(fingersPositionWhenFingerAmountChange);

        var distance = actualDistanceSum - firstDistanceSum;

        return {
            history: touchHistory,
            distance: distance,
            fingerCount: currentFingerCount
        };

    };

    CC.identifyTouchPanOffset = function() {

        if (currentFingerCount < 2) {
            return null;
        }

        var actualPositions = {};
        for (var i in touchHistory) {
            actualPositions[i] = touchHistory[i][touchHistory[i].length-1];
        }

        var actualCenter = CC.calcCenterOfPoints(actualPositions);
        var firstCenter = CC.calcCenterOfPoints(fingersPositionWhenFingerAmountChange);

        return {
            x: actualCenter.x - firstCenter.x,
            y: actualCenter.y - firstCenter.y,
            fingerCount: currentFingerCount
        };
    };

    CC.identifyTouchRotate = function() {

        if (currentFingerCount < 2) {
            return null;
        }

        var actualPositions = {};
        for (var i in touchHistory) {
            actualPositions[i] = touchHistory[i][touchHistory[i].length-1];
        }

        var actualCenter = CC.calcCenterOfPoints(actualPositions);
        var firstCenter = CC.calcCenterOfPoints(fingersPositionWhenFingerAmountChange);

        var angles = [];

        for (var i in fingersPositionWhenFingerAmountChange) {
            var actualAngle = 360 + CC.calcAngleDegrees(actualPositions[i], actualCenter);
            var firstAngle = 360 + CC.calcAngleDegrees(fingersPositionWhenFingerAmountChange[i], firstCenter);

            var angleOffset = (actualAngle - firstAngle) % 360;

            angles.push(angleOffset);
        }

        angles = angles.sort(function(a, b){
            return b - a;
        });

        var angle = angles[Math.floor(angles.length / 2)];

        return {
            angle: angle,
            fingerCount: currentFingerCount
        };

    };

    /******* HELPING METHODS *******/

    var identifySwipe = function(isMouse, history){

        if (history.length < 2) {
            return null;
        }

        var p1 = history[0];
        var p2 = history[history.length-1];

        var distance = CC.calcDistance(p1, p2);

        if (distance < swipeMinDistance) {
            return null;
        }

        var speed = distance / (p2.when - p1.when);

        if (speed < swipeMinSpeed) {
            return null;
        }

        var line = CC.generalFormEqOfLine(p1, p2);

        for (var i = 1; i < history.length-1; i++)
        {
            var deviation = CC.calcLineDistance(line, history[i]);
            if (deviation > swipeMaxDeviation)
            {
                return null;
            }
        }

        var angle = CC.calcAngleDegrees(p1, p2);
        var direction = null;

        if (angle > -20 && angle < 20) {
            direction = "left";
        } else if (angle > 70 && angle < 110) {
            direction = "down";
        } else if (angle > 160 || angle < -160) {
            direction = "right";
        } else if (angle > -110 && angle < -70) {
            direction = "up";
        }


        return {
            history: history,
            isMouse: isMouse,
            distance: distance,
            speed: speed,
            line: line,
            angle: angle,
            direction: direction
        };

    };

    var identifyAndTriggerClickOrTap = function(isMouse, history, event) {

        if (history.length && history[0].type === "startafterlong") {
            return;
        }

        var distance = longestDistance(history);

        if (distance > tapOrClickDistance) {
            return;
        }

        var eventName = "tap";
        if (isMouse) {
            eventName = "click";
        }

        var time = new Date().getTime();
        if (time - lastClickOrTapTime < doubleClickOrTapTime) {
            eventName = "double" + eventName;
        } else {
            lastClickOrTapTime = time;
        }

        if (!isMouse) {
            event.fingerCount = currentFingerCount;
        }

        CC.trigger(eventName, event);
        
    };

    var identifyAndTriggerLongClickOrPress = function(isMouse, history, event){

        longPressTimeout = setTimeout(function(){
            if (!history.length) {
                return;
            }

            var distance = longestDistance(history);

            if (distance <= tapOrClickDistance) {

                var eventName = "longpress";
                if (isMouse) {
                    eventName = "longclick";
                }

                if (!isMouse) {
                    event.fingerCount = currentFingerCount;
                }

                CC.trigger(eventName, event);

                clearHistory(history);

                history.push({
                    type: "startafterlong",
                    x: event.offsetX,
                    y: event.offsetY,
                    when: new Date().getTime()
                });
            }

        }, longPressOrClickTimeout);
    };

    var longestDistance = function(history) {
        var result = 0;

        if (history.length > 1)
        {
            for (var i = 1; i < history.length; i++)
            {
                result = Math.max(result, CC.calcDistance(history[0], history[i]));
            }
        }

        return result;
    };

    var distanceSum = function(fingers) {
        
        var distanceSum = 0;

        for (var i in fingers) {
            var passedI = false;
            for (var j in fingers) {

                if (passedI) {
                    distanceSum += CC.calcDistance(fingers[i], fingers[j]);
                }

                if (i === j) {
                    passedI = true;
                }
            }
        }

        return distanceSum;

    };

    var clearHistory = function(history) {
        while (history.length) {
            history.pop();
        }
    };

    /******* ELEMENTS ********/

    var elclickbinder = function(eventname, nickname){

        CC.bind(eventname, function(event){

            var pos = getEventScreenPosition(event);

            if (!pos) {
                return;
            }

            var clicked = CC.findFirstClickableElementInArea(pos.x, pos.y);

            if (clicked && clicked.trigger)
            {
                if (!nickname) {
                    nickname = eventname;
                }

                clicked.trigger(nickname, event);
            }
        });
    };

    elclickbinder("click");
    elclickbinder("doubleclick");
    elclickbinder("longclick");
    elclickbinder("rightclick");
    elclickbinder("tap");
    elclickbinder("doubletap");
    elclickbinder("longpress");
    elclickbinder("mousemove", "mousemoveover");
    elclickbinder("mousedrag", "mousedragover");
    elclickbinder("touchmove", "touchmoveover");

    var getEventScreenPosition = function(event) {
        if (!event.screen || event.screen.htmlId != screen.htmlId)
        {
            return {x: 0, y: 0};
        }

        var resp = {};

        resp.x = event.offsetX;

        if (event.screen.x)
        {
            resp.x += event.screen.x;
        }

        resp.y = event.offsetY;

        if (event.screen.y)
        {
            resp.y += event.screen.y;
        }

        return resp;
    };

    CC.findFirstClickableElementInArea = function(x, y) {

        var list = CC.areaSearch({
            x: x,
            y: y,
            w: 0,
            h: 0
        });

        if (!list || !list.length) {
            return null;
        }

        var sorted = list.sort(["zIndex", "ASC"], ["getCreationOrder", "DESC"]);

        var result = null;
        sorted.each(function(){
            if (this.clickable) {
                result = this;
                return false;
            }
        });

        return result;

    };

};




/***** KEYBOARD *****/

//depends on event
//is not an internal dependency

(function(){

    var keyPressed = {} //keys pressed
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
        93: "RIGHTCMD",

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

    var keyAlias = {
        CMD: "WIN",
        OPTION: "ALT"
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
            var k = keysArr[i].toUpperCase();
            if (keyAlias[k]) {
                k = keyAlias[k];
            }

            if (!keyPressed[k]) {
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
            
            var k = keysArr[i].toUpperCase();
            if (keyAlias[k]) {
                k = keyAlias[k];
            }

            if (!keyPressed[k]) {
                return false;
            }
            map[k] = true;
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
        return CC.bind("keydown", function(event){
            if (!CC.isKeysPressed(keys)) {
                return;
            }

            //verify if the event key is a desired key
            var wantedArr = keys.toUpperCase().replace(/ /g, "").split("+");

            for (var i in wantedArr) {
                
                var k = wantedArr[i].toUpperCase();
                if (keyAlias[k]) {
                    k = keyAlias[k];
                }

                if (k == keyMapping[event.keyCode]) {
                    action(event);
                    break;
                }
            }

            
        });
    };

    /**
    * if all and only keys are down, trigger the action
    * @param keys which keys you want to check if are pressed as string separeted by '+'
    * @param action a function to be invoked when the event is triggered
    */
    CC.onKeysDownOnly = function(keys, action) {
        return CC.bind("keydown", function(event){
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
    CC.onKeysUpOnly = function(keys, action) {
        return CC.bind("keyup", function(event){
            var wantedArr = keys.toUpperCase().replace(/ /g, "").split("+");
            var wantedMap = {};

            for (var i in wantedArr) {
                var k = wantedArr[i].toUpperCase();
                if (keyAlias[k]) {
                    k = keyAlias[k];
                }

                if (!keyPressed[k] && k != keyMapping[event.keyCode]) {
                    return;
                }
                wantedMap[k] = true;
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

    CC.onKeysSequence = function(keys, maxdelay, action){
        var step = 0;

        var wantedKeys = [];
        for (var i in keys) {
            var k = keys[i].toUpperCase();
            if (keyAlias[k]) {
                k = keyAlias[k];
            }

            wantedKeys.push(k);
        }

        var timeout;

        return CC.bind("keydown", function(event){

            clearTimeout(timeout);

            if (wantedKeys[step] === keyMapping[event.keyCode]) {
                step++;
            } else {
                step = 0;
            }

            if (step == wantedKeys.length) {
                step = 0;
                action();
            }

            timeout = setTimeout(function(){
                step = 0;
            }, maxdelay);

        });

    };

})();




/***** AJAX *****/

(function(){

    //time in milliseconds after which a pending AJAX request is considered unresponsive
    CC.ajaxTimeout = 0;

    var _encode = function(data) {
        var result = "";
        
        if (typeof data === "string") {
            result = data;
        } else {
            var e = encodeURIComponent;

            for (var k in data) {
                if (data.hasOwnProperty(k)) {
                    result += '&' + e(k) + '=' + e(data[k]);
                }
            }
        }
        return result;
    };

    var new_xhr = function() {
        var xhr;
        
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            
            try {
                xhr = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
        }

        return xhr;
    };

    /**
    * CC.Promise CC.ajax( String method, String url [, Object data] [, Object headers] )
    * Make an AJAX request with the specified http method that can be 'GET', 'POST', 'PUT' or 'DELETE', the URL of the Webservice, and optional parameters and headers.
    * https://github.com/CascadeCanvas/CascadeCanvas/wiki/CC.ajax%28-%29
    */
    CC.ajax = function(method, url, data, headers) {

        var p = new CC.Promise();

        var xhr, payload;
        data = data || {};
        headers = headers || {};

        try {
            xhr = new_xhr();
        } catch (e) {
            p.done(false, "no xhr");
        	return p;
        }

        payload = _encode(data);

        if (method === 'GET' && payload) {
            url += '?' + payload;
            payload = null;
        }

        xhr.open(method, url);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        
        for (var h in headers) {
            if (headers.hasOwnProperty(h)) {
                xhr.setRequestHeader(h, headers[h]);
            }
        }

        var onTimeout = function() {
            xhr.abort();
            p.done(false, "timeout", xhr);
        }

        var timeout = CC.ajaxTimeout;
        
        if (timeout) {
            var tid = setTimeout(onTimeout, timeout);
        }

        xhr.onreadystatechange = function() {
            if (timeout) {
                clearTimeout(tid);
            }
            if (xhr.readyState === 4) {
                var success = ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304);
                p.done(success, xhr.responseText, xhr);
            }
        };

        xhr.send(payload);

        return p;
    };

})();




/***** RESOURCE *****/

//depends on promise
//is dependency of element

(function(){

    var sprites = {}; //sprites loaded stored by url

    /**
    * pre-load the image resources used in game
    * @param srcs an array of strings with the path of file
    * @param callback function called when all resources are loaded
    */
    CC.loadResources = function(srcs){
        
        var p = new CC.Promise();

        var loadRecursively = function(index) {
            var img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = srcs[index];
            img.onload = function(){

                sprites[srcs[index]] = this;

                if (index < srcs.length - 1) {
                    loadRecursively(index+1);
                } else {
                    p.done();
                }

            };
        };

        loadRecursively(0);

        return p;

    };

    CC.useResource = function(src){
        return sprites[src];
    };

})();




/***** PROMISE *****/

//depends on drawer, typeChecker
//is dependency of drawer

(function(){

    CC.Color = function(arg) {

        var self = this;
        
        var init = function() {

            if (CC.isString(arg)) {
                self.str = arg;
                self.rgba = strToColor(self.str);
                self.cmyka = rgbaToCmyka(self.rgba);
            } else if (CC.isArray(arg) && arg.length <= 5) {

                if (arg.length == 3) {
                    self.rgba = [arg[0], arg[1], arg[2], 1];
                    self.cmyka = rgbaToCmyka(self.rgba);
                } else if (arg.length == 4) {
                    self.rgba = [arg[0], arg[1], arg[2], arg[3]];
                    self.cmyka = rgbaToCmyka(self.rgba);
                } else {
                    self.cmyka = [arg[0], arg[1], arg[2], arg[3], arg[4]];
                    self.rgba = cmykaToRgba(self.cmyka);
                }

                self.str = rgbaToStr(self.rgba);
            }
            else
            {
                self.valid = false;
                return;
            }

            self.valid = true;
            self.R = self.rgba[0];
            self.G = self.rgba[1];
            self.B = self.rgba[2];
            self.A = self.rgba[3];
            self.C = self.cmyka[0];
            self.M = self.cmyka[1];
            self.Y = self.cmyka[2];
            self.K = self.cmyka[3];
        };

        var strToColor = function(str) {
            var rgbaRegex = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/;

            if (str.indexOf("rgb") > -1) {
                //if str contains 'rgb' or 'rgba' we will parse it
                //it is faster than using the other methods and canvas method can't find alpha correctly

                var values = rgbaRegex.exec(str);

                return [
                    Math.round(parseFloat(values[1])), 
                    Math.round(parseFloat(values[2])), 
                    Math.round(parseFloat(values[3])), 
                    Math.round(parseFloat(values[4] || "1"))
                ];

            } else if (CC.screens[0] && CC.screens[0].context) {
                //if we have a canvas context we will use it to find our color

                var ctx = CC.screens[0].context;
                ctx.fillStyle = str;
                ctx.fillRect(0, 0, 1, 1);
                var rgba = ctx.getImageData(0, 0, 1, 1).data;
                return [rgba[0], rgba[1], rgba[2], rgba[3]/255];
            } else {
                //if we don't have a canvas context yet, we will create a html tag to find the color

                var tempDiv = document.createElement("div");
                tempDiv.style.color = str;
                document.body.appendChild(tempDiv);
                var rgbStr = getComputedStyle(tempDiv).color;
                document.body.removeChild(tempDiv);
                
                var values = rgbaRegex.exec(rgbStr);

                return [
                    Math.round(parseFloat(values[1])), 
                    Math.round(parseFloat(values[2])), 
                    Math.round(parseFloat(values[3])), 
                    1
                ];
            }

        };

        var rgbaToCmyka = function(rgba) {
            if (rgba[0] === 0 && rgba[1] === 0 && rgba[2] === 0)
            {
                return [0, 0, 0, 1, 1];
            }
            else
            {
                var c = 1 - (rgba[0] / 255),
                    m = 1 - (rgba[1] / 255),
                    y = 1 - (rgba[2] / 255),
                    k = Math.min(c, m, y);

                
                c = ((c - k) / (1 - k));
                m = ((m - k) / (1 - k));
                y = ((y  - k) / (1 - k));

                return [c, m, y, k, rgba[3]];
            }
        };

        var cmykaToRgba = function(cmyka) {
            var R = cmyka[0] * (1.0 - cmyka[3]) + cmyka[3], 
                G = cmyka[1] * (1.0 - cmyka[3]) + cmyka[3],
                B = cmyka[2] * (1.0 - cmyka[3]) + cmyka[3];

            R = Math.round((1.0 - R) * 255.0 + 0.5);
            G = Math.round((1.0 - G) * 255.0 + 0.5);
            B = Math.round((1.0 - B) * 255.0 + 0.5);

            return [R, G, B, cmyka[4]];
        };

        var rgbaToStr = function(rgba) {
            return "rgba("+rgba[0]+", "+rgba[1]+", "+rgba[2]+", "+rgba[3]+")";
        };

        this.mixWith = function(other, pct) {
            if (!CC.isNumber(pct)) {
                pct = 50;
            }
            var dif = 100 - pct;

            return new CC.Color([
                (this.C*dif + other.C*pct) / 100,
                (this.M*dif + other.M*pct) / 100,
                (this.Y*dif + other.Y*pct) / 100,
                (this.K*dif + other.K*pct) / 100,
                (this.A*dif + other.A*pct) / 100
            ]);
        };

        init();
    };

})();




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
            return originVal;
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




/***** LOOP *****/

//depends on event and drawer
//is not a internal dependency

(function(){
    var running = false;
    var requestAnimId;
    var intervalAnimId;
    

    /**
    * start the routine of the gameloop, for each loop it triggers 'enterframe' event and render the elements
    */
    CC.startLoop = function(){

        running = true;

        CC.loadScreens();

        var mainloop = function(){

            CC.trigger("enterframe");
            CC.draw();
        };

        var animFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            null;

        if (animFrame !== null) {
            
            var recursiveAnim = function() {
                mainloop();
                requestAnimId = animFrame(recursiveAnim);
            };

            // start the mainloop
            requestAnimId = animFrame(recursiveAnim);

        } else {
            var ONE_FRAME_TIME = 1000.0 / 60.0 ;
            intervalAnimId = setInterval( mainloop, ONE_FRAME_TIME );
        }

    };

    /**
    * stop the gameloop
    */
    CC.stopLoop = function(){

        running = false;

        if (requestAnimId) {
            var cancelFrame = window.cancelAnimationFrame ||
                window.webkitCancelAnimationFrame ||
                window.mozCancelAnimationFrame    ||
                window.oCancelAnimationFrame      ||
                window.msCancelAnimationFrame     ||
                null;

            if (cancelFrame !== null) {
                cancelFrame(requestAnimId);
                requestAnimId = null;
            }
        }

        if (intervalAnimId) {
            clearInterval(intervalAnimId);
            intervalAnimId = null;
        }
    };

    /**
    * check if loop is enabled. Important: "stopLoop" will not disable the loop, only "pause" will do it
    */
    CC.isRunning = function(){
        return running;
    };
    
})();




/***** ELEMENT *****/

//depends on typeChecker, objectTools, event, resource
//is dependency of elementlist

var creationCount = 0;

/**
* the base element, all elements inherit this
*/
var Element = function(specs, opts){

    var el = this,
        removed = false, //an extra protection to ignore removed elements
        creationTime = new Date().getTime(),
        creationOrder = creationCount++;

    this.classes = {}; //classes this inherits
    this.layers = {}; //a Map of layers or functions by name to be draw

    /**
    * routine for initialization:
    *  - set its ID
    *  - set the properties of the option
    *  - initialize the events
    *  - make it inherit the classes
    */
    var init = function(){

        var idArray;

        if (CC.isString(specs)) {
            idArray = specs.match(/#[a-zA-Z0-9]*/);
        }

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
            el.fixedOnScreen = opts.fixedOnScreen;

            el.clickable = opts.clickable !== false;
        }

        eventEnvironmentBuilder(el, function(){ return !removed; }); 
        //should not trigger an event if the element is removed
        bindRemoveEvent();

        if (CC.isString(specs)) {
            el.inherit(specs.replace(/#[a-zA-Z0-9]*/g, ""), opts);
        }

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

            if (a === undefined || b === undefined) {
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

        var args = [].splice.call(arguments, 0);
        args.splice(0, 0, this); //insert in fist position

        CC.merge.apply(CC, args);

        return this;
    };

    /**
    * remove the element
    */
    this.remove = function(){

        CC.remove(this);

    };

    var bindRemoveEvent = function() {

        el.bind("remove", function(){
            removed = true;
        });
    };

    /**
    * if the class bind the event 'removeClass' the class is removed correctly
    */
    this.removeClass = function(classe){

        if (this.classes[classe] !== undefined) {
            this.trigger("removeClass."+classe);
            this.unbind("."+classe);
            delete this.classes[classe];
        }

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

    this.hideAllLayers = function() {
        for (var i in this.layers) {
            this.layers[i].hidden = true;
        }
    };

    this.toggleLayers = function(toHide, toShow, steps, effect) {

        if (!steps) {
            this.layers[toHide].hidden = true;
            this.layers[toShow].hidden = false;
            return null;
        } 

        var opt = {
            target: {},
            origin: this.layers[toHide],
            destination: this.layers[toShow],
            steps: steps,
            effect: effect
        }

        var anim = CC.layerAnimation(this, opt);

        anim.beforeStart(function() {
            opt.target = {};
            el.layers["CCTemp-"+toHide+"-"+toShow] = opt.target;
            opt.origin = el.layers[toHide];
            opt.origin.hidden = true;
            opt.destination = el.layers[toShow];
        }); 

        anim.then(function(){

            delete el.layers["CCTemp-"+toHide+"-"+toShow];
            el.layers[toShow].hidden = false;

        });

        return anim;
    };

    this.animateLayer = function(targetLayer, changes, steps, effect) {

        var opt = {
            target: {},
            origin: this.layers[targetLayer],
            destination: {},
            steps: steps,
            effect: effect
        };

        var anim = CC.layerAnimation(this, opt);

        anim.beforeStart(function() {
            opt.target = {};
            el.layers["CCTemp-"+targetLayer] = opt.target;
            opt.origin = el.layers[targetLayer];
            opt.origin.hidden = true;
            opt.destination = CC.merge({}, el.layers[targetLayer], changes);
        });

        anim.then(function(){

            delete el.layers["CCTemp-"+targetLayer];
            el.layers[targetLayer] = opt.destination;
            el.layers[targetLayer].hidden = false;

        });

        return anim;
    };

    this.getCreationTime = function() {
        return creationTime;
    };

    this.getCreationOrder = function() {
        return creationOrder;
    };

    init();

};




/***** ELEMENTLIST *****/

//depends on element, objectTools
//is not a internal dependency


CC.fn = {}; //functions elementlist implement (global methods)

/**
* a collection of elements
*/
var ElementList = function(elements, selection){

    this.selection = selection;
    this.length = elements.length;
    var this_ = this;

    var init = function(){
    	implementGlobalMethods();
    };

    var implementGlobalMethods = function(){

        for (var i in CC.fn) {
            
            if (CC.isFunction(CC.fn[i])) {
                this_[i] = CC.fn[i];
            }

        }

    };

    /**
    * invoke an action for all elements selected
    */
    this.each = function(action){

        for (var i in elements) {

            var quitIfFalse = action.call(elements[i]);

            if (quitIfFalse === false)
            {
                break;
            }

        }

        return this;

    };

    /**
    * get an element by the index.
    */
    this.e = function(index){
        return elements[index];
    };

    /**
    * returns a copy of the elements as array
    */
    this.asArray = function(){
        return elements.slice(0);
    };

    /**
    * autosort the collection by the attribute
    */
    this.sort = function(){

        var args = [].slice.call(arguments, 0); //copy
        args.unshift(elements);

        elements = CC.sort.apply(null, args);

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

        return new ElementList(result, selection + "\n" + JSON.stringify(atrs) + "\n\n");

    };

    this.add = function(otherElements){

        if (otherElements == null) {
            return this;
        }

        if (CC.isString(otherElements)) {
            otherElements = CC(otherElements);
        } else if (!CC.isFunction(otherElements.asArray)) {
            return this;
        }

        var resultArray = elements.concat(otherElements.asArray());
        var resultSelection = this.selection + " + " + otherElements.selection;
        return new ElementList(resultArray, resultSelection);

    };

    this.sub = function(otherElements){

        if (otherElements == null) {
            return this;
        }

        if (CC.isString(otherElements)) {
            otherElements = CC(otherElements);
        } else if (!CC.isFunction(otherElements.each)) {
            return this;
        }

        var resultArray = this.asArray();

        otherElements.each(function(){
            var index = resultArray.indexOf(this);
            if (index > -1) {
                resultArray.splice(index, 1);
            }
        });

        var resultSelection = this.selection + " - " + otherElements.selection;
        return new ElementList(resultArray, resultSelection);

    };

    /**
    * invoke the constructors for this element
    * @param classesStr a string with the name of the classes to this element inherit, example:
    * 'Class1 Class2' - this element will inherit both
    */
    this.inherit = function(classesStr, opts){

        this.each(function(){
            this.inherit(classesStr, opts);
        });

        return this;

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

    this.removeClass = function(classe){

        this.each(function(){
            this.removeClass(classe);
        });

    };

    this.bind = function(eventsStr, action){

        var listOfEvents = [];

        this.each(function(){
            listOfEvents.push(
                this.bind(eventsStr, action)
            );
        });

        return {
            unbind: function() {
                for (var i in listOfEvents) {
                    listOfEvents[i].unbind();
                }
            }
        };

    };

    this.unbind = function(eventsStr, action){

        this.each(function(){
            this.unbind(eventsStr, action);
        });

        return this;

    };

    this.trigger = function(){

        var args = arguments;

        this.each(function(){
            this.trigger.apply(this, args);
        });

        return this;

    };

    this.became = function(){


        var args = arguments;
        var listOfEvents = [];

        this.each(function(){
            listOfEvents.push(
                this.became.apply(this, args)
            );
        });

        return {
            unbind: function() {
                for (var i in listOfEvents) {
                    listOfEvents[i].unbind();
                }
            }
        };

    };

    this.while = function(){


        var args = arguments;
        var listOfEvents = [];

        this.each(function(){
            listOfEvents.push(
                this.while.apply(this, args)
            );
        });

        return {
            unbind: function() {
                for (var i in listOfEvents) {
                    listOfEvents[i].unbind();
                }
            }
        };

    };


    this.hideAllLayers = function(){

        this.each(function(){
            this.hideAllLayers();
        });

    };


    this.toggleLayers = function(toHide, toShow){

        this.each(function(){
            this.toggleLayers(toHide, toShow);
        });

    };

    init();

};




/***** ANIMATION *****/

(function(){

	/**
	* Constructor( Function[] loopers, Number totalsteps [, String easing] [, Object params])
	* Constructs an animation with a single or multiple fixed length loopers to start at the same time; 
	* the number of steps this animation will take; easing effect and params to be passed to the loopers
	*
	* Constructor( Function[] loopers [, Object params])
	* Constructs an animation with a single or multiple autostop loopers to start at the same time and
	* params to be passed to the loopers
	*
	* https://github.com/CascadeCanvas/CascadeCanvas/wiki/CC.Animation
	*/
	CC.Animation = function() {

		var self = this;

		var args = [].splice.call(arguments, 0), //copy
			loopers = args[0],
			totalsteps = args[1],
			effect = args[2],
			params = args[args.length-1],
			currentStep = 0,
			finishedLoopers = 0,
			pct = 0,
			enderframe = undefined,
			callbacks = [],
			beforeStart = [];

		if (!CC.isArray(loopers)) {
			loopers = [loopers];
		}

		if (!CC.isNumber(totalsteps)) {
			totalsteps = undefined;
		}

		if (!CC.isString(effect)) {
			effect = undefined;
		}

		if (!CC.isObject(params)) {
			params = undefined;
		}

		this.isPlaying = false;

		/**
		* void then( Function callback )
		* Register callbacks, functions to be called when the animation completes
		* https://github.com/CascadeCanvas/CascadeCanvas/wiki/animation.then
		*/
		this.then = function(cb) {
			callbacks.push(cb);
		};

		/**
		* void beforeStart( Function callback )
		* Register a function to be called when the animation is about to start
		* https://github.com/CascadeCanvas/CascadeCanvas/wiki/animation.beforeStart
		*/
		this.beforeStart = function(bf) {
			beforeStart.push(bf);
		};

		/**
		* void removeCallback( Function callback )
		* Removes a callback registered with animation.then or animation.beforeStart
		* https://github.com/CascadeCanvas/CascadeCanvas/wiki/animation.removeCallback
		*/
		this.removeCallback = function(cb) {
			for (var i in callbacks){
				if (cb === callbacks[i]) {
					callbacks[i] = null;
				}
			}

			for (var i in beforeStart){
				if (cb === beforeStart[i]) {
					beforeStart[i] = null;
				}
			}
		};

		/**
		* void done()
		* Completes the animation
		* https://github.com/CascadeCanvas/CascadeCanvas/wiki/animation.done
		*/
		this.done = function() {
			this.pause();
			currentStep = 0;
			finishedLoopers = 0;
			pct = 0;

			for (var i in callbacks) {
				var resp = null;
				var cb = callbacks[i];
				
				if (cb) { 
					resp = cb();
				}

				if (resp && CC.isFunction(resp.start) && resp.isPlaying === false) {
					resp.start();
				}
			}
		};

		/**
		* void resume()
		* Starts or resume the paused animation
		* https://github.com/CascadeCanvas/CascadeCanvas/wiki/animation.resume
		*/
		this.resume = function() {
			if (this.isPlaying) {
				return;
			}

			this.isPlaying = true;

			enterframe = CC.bind("enterframe", function(){
				var keepGoing = undefined;

				if (currentStep === 0) {
					callBeforeStart();
				}

				if (totalsteps !== undefined) {
					pct = CC.easing.linear(currentStep, 0, 100, totalsteps);
					var showPct = pct;

					if (CC.isFunction(CC.easing[effect])) {
						showPct = CC.easing[effect](currentStep, 0, 100, totalsteps);
					}

					if (pct < 100) {
						for (var i in loopers) {
							keepGoing = loopers[i].apply(CC, [showPct, params]);
						}
					}
				} else {
					for (var i in loopers) {
						keepGoing = loopers[i].apply(CC, [currentStep, params]);
					}
				}

				if (keepGoing === false) {
					finishedLoopers++;
				}

				currentStep++;

				if (pct >= 100 || finishedLoopers >= loopers.length) {
					self.done();
				}
			});
		};

		/**
		* void pause()
		* Pauses the animation
		* https://github.com/CascadeCanvas/CascadeCanvas/wiki/animation.pause
		*/
		this.pause = function() {
			if (!this.isPlaying) {
				return;
			}

			this.isPlaying = false;
			if (enterframe) {
				enterframe.unbind();
			}
		};

		/** 
		* void togglePause()
		* If the animation is paused it resumes it, if the animation is playing it pauses it
		* https://github.com/CascadeCanvas/CascadeCanvas/wiki/animation.togglePause
		*/
		this.togglePause = function() {
			if (this.isPlaying) {
				this.pause();
			} else {
				this.resume();
			}
		};

		/**
		* Starts the animation from the beginning
		* void start()
		* https://github.com/CascadeCanvas/CascadeCanvas/wiki/animation.start
		*/
		this.start = function() {
			currentStep = 0;
			this.resume();
		};

		var callBeforeStart = function() {
			for (var i in beforeStart) {
				beforeStart[i]();
			}
		};

		/**
		* void loop()
		* Makes the animation start from beginning and loop itself forever until pause is called
		* https://github.com/CascadeCanvas/CascadeCanvas/wiki/animation.loop
		*/
		this.loop = function() {
			this.then(function(){
				self.start();
			});

			this.start();
		};

	};

	/**
	* CC.Animation CC.animationChain( CC.Animation[] animations )
	* let you create an animation that runs a sequence of animations, including delay
	* https://github.com/CascadeCanvas/CascadeCanvas/wiki/CC.animationChain
	*/
	CC.animationChain = function(animations) {
        
        if (animations.length === 0) {
            return null;
        }
        
        var totalAn = new CC.Animation();

        var currentPlaying = 0;

        for (var i in animations) {

	        if (CC.isNumber(animations[i])) {
	        	//a delay
	        	animations[i] = new CC.Animation(function(){}, animations[i]);
	        }

	        (function(){
		        var index = parseInt(i);

		        animations[i].then(function(){
		        	if (animations.length > index+1) {
		        		currentPlaying = index+1;
		        		animations[currentPlaying].start();
		        	} else {
		        		totalAn.done();
		        	}
		        });
		    })();
        }

        totalAn.start = function(){
        	currentPlaying = 0;
        	this.isPlaying = true;
        	animations[currentPlaying].start();
        };

        totalAn.resume = function(){
        	this.isPlaying = true;
        	animations[currentPlaying].resume();
        };

        totalAn.pause = function() {
        	this.isPlaying = false;
        	animations[currentPlaying].pause();
        };

        return totalAn;
    };

    /**
    * CC.Animation CC.layerAnimation( Element element, Object option )
    * let you transform one layer to another making use of tween technic
    * https://github.com/CascadeCanvas/CascadeCanvas/wiki/CC.layerAnimation
    */
	CC.layerAnimation = function(element, opt){

		var animation = new CC.Animation(function(pct){
			CC.transformLayer(element, opt, pct);
		}, opt.steps, opt.effect);

		animation.beforeStart(function(){

			if (opt.target.zIndex !== opt.destination.zIndex) {
				if (opt.target.zIndex === undefined) {
					opt.target.zIndex = 0;
				}

				if (opt.destination.zIndex === undefined) {
					opt.destination.zIndex = 0;
				}
			}
		});

		return animation;

	};

	CC.easing = {
		linear: function (t, b, c, d) {
			return c*t/d + b;
		},
		easeInQuad: function (t, b, c, d) {
			return c*(t/=d)*t + b;
		},
		easeOutQuad: function (t, b, c, d) {
			return -c *(t/=d)*(t-2) + b;
		},
		easeInOutQuad: function (t, b, c, d) {
			if ((t/=d/2) < 1) return c/2*t*t + b;
			return -c/2 * ((--t)*(t-2) - 1) + b;
		},
		easeInCubic: function (t, b, c, d) {
			return c*(t/=d)*t*t + b;
		},
		easeOutCubic: function (t, b, c, d) {
			return c*((t=t/d-1)*t*t + 1) + b;
		},
		easeInOutCubic: function (t, b, c, d) {
			if ((t/=d/2) < 1) return c/2*t*t*t + b;
			return c/2*((t-=2)*t*t + 2) + b;
		},
		easeInQuart: function (t, b, c, d) {
			return c*(t/=d)*t*t*t + b;
		},
		easeOutQuart: function (t, b, c, d) {
			return -c * ((t=t/d-1)*t*t*t - 1) + b;
		},
		easeInOutQuart: function (t, b, c, d) {
			if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
			return -c/2 * ((t-=2)*t*t*t - 2) + b;
		},
		easeInQuint: function (t, b, c, d) {
			return c*(t/=d)*t*t*t*t + b;
		},
		easeOutQuint: function (t, b, c, d) {
			return c*((t=t/d-1)*t*t*t*t + 1) + b;
		},
		easeInOutQuint: function (t, b, c, d) {
			if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
			return c/2*((t-=2)*t*t*t*t + 2) + b;
		},
		easeInSine: function (t, b, c, d) {
			return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
		},
		easeOutSine: function (t, b, c, d) {
			return c * Math.sin(t/d * (Math.PI/2)) + b;
		},
		easeInOutSine: function (t, b, c, d) {
			return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
		},
		easeInExpo: function (t, b, c, d) {
			return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
		},
		easeOutExpo: function (t, b, c, d) {
			return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
		},
		easeInOutExpo: function (t, b, c, d) {
			if (t==0) return b;
			if (t==d) return b+c;
			if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
			return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
		},
		easeInCirc: function (t, b, c, d) {
			return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
		},
		easeOutCirc: function (t, b, c, d) {
			return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
		},
		easeInOutCirc: function (t, b, c, d) {
			if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
			return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
		},
		easeInElastic: function (t, b, c, d) {
			var s=1.70158;var p=0;var a=c;
			if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
			if (a < Math.abs(c)) { a=c; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (c/a);
			return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		},
		easeOutElastic: function (t, b, c, d) {
			var s=1.70158;var p=0;var a=c;
			if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
			if (a < Math.abs(c)) { a=c; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (c/a);
			return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
		},
		easeInOutElastic: function (t, b, c, d) {
			var s=1.70158;var p=0;var a=c;
			if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
			if (a < Math.abs(c)) { a=c; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (c/a);
			if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
			return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
		},
		easeInBack: function (t, b, c, d, s) {
			if (s == undefined) s = 1.70158;
			return c*(t/=d)*t*((s+1)*t - s) + b;
		},
		easeOutBack: function (t, b, c, d, s) {
			if (s == undefined) s = 1.70158;
			return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
		},
		easeInOutBack: function (t, b, c, d, s) {
			if (s == undefined) s = 1.70158; 
			if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
			return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
		},
		easeInBounce: function (t, b, c, d) {
			return c - CC.easing.easeOutBounce (d-t, 0, c, d) + b;
		},
		easeOutBounce: function (t, b, c, d) {
			if ((t/=d) < (1/2.75)) {
				return c*(7.5625*t*t) + b;
			} else if (t < (2/2.75)) {
				return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
			} else if (t < (2.5/2.75)) {
				return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
			} else {
				return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
			}
		},
		easeInOutBounce: function (t, b, c, d) {
			if (t < d/2) return CC.easing.easeInBounce (t*2, 0, c, d) * .5 + b;
			return CC.easing.easeOutBounce (t*2-d, 0, c, d) * .5 + c*.5 + b;
		}
	};

})();




return CC;

}));