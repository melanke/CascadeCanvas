describe("mouse", function(){

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

	// it("binds TouchStart", function(){

	// 	var triggered = false;

	// 	CC.bind("touchstart", function(){
	// 		triggered = true;
	// 	});

	// 	expect(triggered).toBe(false);


	// 	createTouchEvent(canvas, "touchstart", [0, 0]);

	// 	expect(triggered).toBe(true);

	// 	removeCanvas();

	// });

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