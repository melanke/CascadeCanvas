describe("mouse", function(){




















function computedStyle(el, prop) {
    return (
        window.getComputedStyle ? window.getComputedStyle(el) : el.currentStyle
    )[prop.replace(/-(\w)/gi, function (word, letter) {
        return letter.toUpperCase();
    })];
}

function getChildrenSize(container) {
    if (!container) {
        return;
    }
    var children = [].slice.call(container.children, 0).filter(function (el) {
        var pos = computedStyle(el, 'position');
        el.rect = el.getBoundingClientRect(); // store rect for later
        return !(
            (pos === 'absolute' || pos === 'fixed') ||
            (el.rect.width === 0 && el.rect.height === 0)
        );
    });
    if (children.length === 0) {
        return {
            width: 0,
            height: 0
        };
    }

    var totRect = children.reduce(function (tot, el) {
        return (!tot ?
            el.rect : {
                top: Math.min(tot.top, el.rect.top),
                left: Math.min(tot.left, el.rect.left),
                right: Math.max(tot.right, el.rect.right),
                bottom: Math.max(tot.bottom, el.rect.bottom)
            });
    }, null);

    return {
        width: totRect.right - totRect.left,
        height: totRect.bottom - totRect.top
    };
}

/*
    list can be either [[x, y], [x, y]] or [x, y]
*/
function createTouchList(target, list) {
    if (Array.isArray(list) && list[0] && !Array.isArray(list[0])) {
        list = [list];
    }
    list = list.map(function (entry, index) {
        return createTouch(entry[0], entry[1], target, index + 1);
    });
    return document.createTouchList.apply(document, list);
}

function createTouch(x, y, target, id) {
    return document.createTouch(window, target,
        //identifier
        id || 1,
        //pageX / clientX
        x,
        //pageY / clientY
        y,
        //screenX
        x,
        //screenY
        y
    );
}

//http://stackoverflow.com/questions/7056026/variation-of-e-touches-e-targettouches-and-e-changedtouches
function initTouchEvent(touchEvent, type, touches) {
    var touch1 = touches[0];
    return touchEvent.initTouchEvent(
        //touches
        touches,
        //targetTouches
        touches,
        //changedTouches
        touches,
        //type
        type,
        //view
        window,
        //screenX
        touch1.screenX,
        //screenY
        touch1.screenY,
        //clientX
        touch1.clientX,
        //clientY
        touch1.clientY,
        //ctrlKey
        false,
        //altKey
        false,
        //shiftKey
        false,
        //metaKey
        false
    );
}

function createTouchEvent(elem, type, touches) {
    var touchEvent = document.createEvent('TouchEvent');
    if (Array.isArray(touches)) {
        touches = createTouchList(elem, touches);
    }

    function dispatch(getEvent) {
        initTouchEvent(touchEvent, type, touches);
        if (typeof getEvent === 'function'){
            getEvent.call(elem, touchEvent, elem);
        }
        elem.dispatchEvent(touchEvent);
    }
    dispatch.event = touchEvent;
    return dispatch;
}

function apply(fn, arg, args) {
    return fn.apply(null, [arg].concat(Array.prototype.slice.call(args)));
}

function swipeLeft() {
    return apply(swipe, 'left', arguments);
}

function swipeRight() {
    return apply(swipe, 'right', arguments);
}

function swipeTop(){
    return apply(swipe, 'top', arguments);
}

function swipeBottom(){
    return apply(swipe, 'bottom', arguments);
}

function round(num){
    return Math.round(num);
}

var HORIZONTAL_OFFSET = 45;
var VERTICAL_OFFSET = 10;
function swipe(direction, elem, ms, frames, getEvent) {
    var elemSize = getChildrenSize(elem.parentNode);

    var x;
    var y;
    var from;
    var to;
    var isVertical = direction === 'top' || direction === 'bottom';
    if (isVertical){
        y = elemSize.height;
        x = elemSize.width / 2;

        from = [x*0.95, VERTICAL_OFFSET].map(round);
        to   = [x*1.01, y-VERTICAL_OFFSET].map(round);
    } else {
        // horizontal
        x = elemSize.width;
        y = elemSize.height / 2;
        from = [HORIZONTAL_OFFSET, y*0.98].map(round);
        to   = [x - HORIZONTAL_OFFSET, y*1.01].map(round);
    }

    if (direction === 'right' || direction === 'top') {
        touchActionSequence(elem, from, to, ms, frames, getEvent);
    } else {
        touchActionSequence(elem, to, from, ms, frames, getEvent);
    }
}

function getDiff(fromList, toList){
    return [
        toList[0] - fromList[0],
        toList[1] - fromList[1]
    ];
}

function getXandYFrame(startPoint, diffToWalk, currentProgress){
    return [
        Math.round(
            Math.abs(
                startPoint[0] + (diffToWalk[0] * currentProgress))),
        Math.round(
            Math.abs(
                startPoint[1] + (diffToWalk[1] * currentProgress)))
    ];
}

function touchActionSequence(elem, fromXandY, toXandY, ms, frames, getEvent) {
    frames       = frames || 10;
    ms           = Math.round((ms||1000) / frames);
    // lets find difference from start to end and divide on frames
    var diff     = getDiff(fromXandY, toXandY);
    var counter  = frames;
    var pos             = getXandYFrame(fromXandY, diff, counter/frames);
    var targetElement;

    targetElement   = document.elementFromPoint(pos[0], pos[1]);

    setTimeout(function handler() {
        counter--;
        if (counter) {
            pos = getXandYFrame(fromXandY, diff, counter/frames);
            targetElement = document.elementFromPoint(pos[0], pos[1]);
            createTouchEvent(targetElement||elem, 'touchmove', pos)(getEvent);
            setTimeout(handler, ms);
        } else {
            createTouchEvent(targetElement||elem, 'touchend', [[0, 0]])(getEvent);
        }
    }, ms);
    createTouchEvent(targetElement||elem, 'touchstart', pos)(getEvent);
}

function factory(){
    return {
        _apply: apply,
        _getXandYFrame: getXandYFrame,
        _getDiff: getDiff,
        swipeLeft: swipeLeft,
        swipeRight: swipeRight,
        swipeTop: swipeTop,
        swipeBottom: swipeBottom,
        touchActionSequence: touchActionSequence,
        createTouchEvent: createTouchEvent
    };
}

if (typeof module !== 'undefined' && module.exports){
    module.exports = factory();
} else {
    window.mockPhantomTouchEvents = factory();
}






















	var appendCanvas = function(id) {
		var c = document.createElement("canvas");
		c.setAttribute("id", id);
		document.body.appendChild(c);
		return c;
	};

	var removeCanvas = function() {
		var cs = document.getElementsByTagName("canvas"); 
		for (var i in cs) { 
			var c = cs[i];
			c.parentNode && c.parentNode.removeChild(c);
		}
		CC.screens = [];
	};

	var canvas;

	beforeEach(function(){
		CC.clear();

		canvas = appendCanvas("canvasId");

		CC.screens = [{
			htmlId: "canvasId"
		}];

		CC.loadScreens();
	});

	afterEach(function(){
		removeCanvas();
	});

	it("binds OnSelectStart", function(){

		expect(canvas.onselectstart()).toBe(false);

		removeCanvas();

	});

	it("binds OnClick", function(){

		var triggered = false;

		CC.bind("click", function(){
			triggered = true;
		});

		expect(triggered).toBe(false);

		canvas.onmousedown({});
		canvas.onmouseup({});

		expect(triggered).toBe(true);

	});

	it("binds OnContextMenu", function(){

		var triggered = false;

		CC.bind("rightclick", function(){
			triggered = true;
		});

		expect(triggered).toBe(false);

		canvas.oncontextmenu({});

		expect(triggered).toBe(true);

		removeCanvas();

	});

	it("binds OnMouseMove", function(){

		var triggered = false;

		CC.bind("mousemove", function(){
			triggered = true;
		});

		expect(triggered).toBe(false);

		canvas.onmousemove({});

		expect(triggered).toBe(true);

		removeCanvas();

	});

	//TODO: UNIT TEST TOUCH EVENTS - problem: mock touch events

	it("binds TouchStart", function(){

		var triggered = false;

		CC.bind("touchstart", function(){
			triggered = true;
		});

		expect(triggered).toBe(false);


		createTouchEvent(canvas, "touchstart", [0, 0])();
		// createTouchEvent(canvas, "touchend", [0, 0])();

		expect(triggered).toBe(true);

		removeCanvas();

	});

	describe("at the element", function(){

		it("triggers if it is clicked and it is on top", function(){
			var triggeredTimes = 0;

			var el = CC.new("#El", {
				x: 60,
				y: 90,
				w: 30,
				h: 30
			});

			var el2 = CC.new("#El2", {
				x: 60,
				y: 90,
				w: 30,
				h: 30,
				clickable: true,
				zIndex: 1 //is behind
			});

			el.bind("click", function(){
				triggeredTimes++;
			});

			expect(triggeredTimes).toBe(0);

			CC.trigger("click", {
				offsetX: 70,
				offsetY: 100,
				screen: {
					htmlId: "canvasId"
				}
			});

			expect(triggeredTimes).toBe(1);

			CC.trigger("click", {
				offsetX: 50,
				offsetY: 100,
				screen: {
					htmlId: "canvasId"
				}
			});

			expect(triggeredTimes).toBe(1);
		});

		it("doesnt triggers if it is clicked but it is not on top", function(){
			var triggeredTimes = 0;

			var el = CC.new("#El", {
				x: 60,
				y: 90,
				w: 30,
				h: 30
			});

			var el2 = CC.new("#El2", {
				x: 60,
				y: 90,
				w: 30,
				h: 30,
				clickable: true
			});

			el.bind("click", function(){
				triggeredTimes++;
			});

			expect(triggeredTimes).toBe(0);

			CC.trigger("click", {
				offsetX: 70,
				offsetY: 100,
				screen: {
					htmlId: "canvasId"
				}
			});

			expect(triggeredTimes).toBe(0);
		});

	});

	describe("at element list", function(){

		it("click one of the elements of the list", function(){

			var triggeredTimes = 0;

			CC.new("#El1 Class1", {
				x: 60,
				y: 90,
				w: 30,
				h: 30
			});

			CC.new("#El2 Class1", {
				x: 60,
				y: 90,
				w: 30,
				h: 30
			});

			var ccevt = CC("Class1").bind("click", function(){
				triggeredTimes++;
			});

			expect(triggeredTimes).toBe(0);

			CC.trigger("click", {
				offsetX: 70,
				offsetY: 100,
				screen: {
					htmlId: "canvasId"
				}
			});

			expect(triggeredTimes).toBe(1);

			CC.trigger("click", {
				offsetX: 50,
				offsetY: 100,
				screen: {
					htmlId: "canvasId"
				}
			});

			expect(triggeredTimes).toBe(1);

			ccevt.unbind();
		});

	});

});