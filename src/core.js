var elementMap = {} //elements stored by id
,   elementsSize = 0
,   events = {} //events stored by name
,   running = true
,   sprites = {} //sprites loaded stored by url
,   canvas = document.getElementById('CascadeCanvas')
,   keyPressed = {} //keys pressed
,   keyMapping = {
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
* check if param is an object
*/
CC.isObject = function(objectToCheck){
    return objectToCheck && objectToCheck.constructor == Object;
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
            if (CC.isObject(obj[p])) {

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
        
        var recursiveAnim = function() {
            mainloop();
            animFrame(recursiveAnim);
        };

        // start the mainloop
        animFrame(recursiveAnim);

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