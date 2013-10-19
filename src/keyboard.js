/***** KEYBOARD *****/

//depends on event
//is not an internal dependency

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
        if (keyAlias[i]) {
            i = keyAlias[i];
        }

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
        if (keyAlias[i]) {
            i = keyAlias[i];
        }

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
    return CC.bind("keydown", function(event){
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
            if (keyAlias[i]) {
                i = keyAlias[i];
            }

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

    CC.bind("keydown", function(event){

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