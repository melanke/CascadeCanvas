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

        return sorted.e(0);

    };

};