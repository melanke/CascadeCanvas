//I did not find a way to test CC.loadResource yet, so I could not test sprites and tiles

describe("drawer", function () {

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

	describe("loadScreens", function(){

		it("dont load the screen if any is set up", function(){

			expect(CC.screens.length).toBe(0);
			
			CC.loadScreens();

			expect(CC.screens.length).toBe(0);

		});

		it("loads the default canvas", function(){

			expect(CC.screens.length).toBe(0);

			appendCanvas("CascadeCanvas");

			CC.loadScreens();

			expect(CC.screens.length).toBe(1);
			expect(CC.screens[0].htmlId).toBe("CascadeCanvas");
			expect(CC.screens[0].x).toBe(0);
			expect(CC.screens[0].y).toBe(0);

			removeCanvas();
		});

		it("loads the defined screens and gets the context", function(){

			appendCanvas("canvasId");

			CC.screens = [{
				htmlId: "canvasId"
			}];

			CC.loadScreens();

			expect(CC.screens[0].x).toBe(0);
			expect(CC.screens[0].y).toBe(0);
			expect(CC.screens[0].context).toBeDefined();

			removeCanvas();

		});

		it("dont load again the same screen", function(){

			appendCanvas("canvasId");

			CC.screens = [{
				htmlId: "canvasId"
			}];

			CC.loadScreens();

			CC.screens[0].x = 5;
			CC.screens[0].y = 6;

			CC.loadScreens();

			expect(CC.screens[0].x).toBe(5);
			expect(CC.screens[0].y).toBe(6);
			expect(CC.screens[0].context).toBeDefined();

			removeCanvas();

		});

		it("dont loads the defined screens if it dont have htmlId", function(){

			appendCanvas("canvasId");

			CC.screens = [{
			}];

			CC.loadScreens();

			expect(CC.screens[0]).not.toBeDefined();

			removeCanvas();

		});

		it("dont loads the defined screens if we cant fint a canvas from its htmlId", function(){

			CC.screens = [{
				htmlId: "canvasId"
			}];

			CC.loadScreens();

			expect(CC.screens[0]).not.toBeDefined();

		});

		describe("setCenter", function(){

			it("sets the center", function(){

				appendCanvas("canvasId");

				CC.screens = [{
					htmlId: "canvasId",
					w: 100,
					h: 50
				}];

				CC.loadScreens();

				CC.screens[0].setCenter(234, 56);

				expect(CC.screens[0].x).toBe(184);
				expect(CC.screens[0].y).toBe(31);

				removeCanvas();

			});

			it("sets the center but dont cross the boundary minX", function(){

				appendCanvas("canvasId");

				CC.screens = [{
					htmlId: "canvasId",
					w: 100,
					h: 50,
					minX: 189
				}];

				CC.loadScreens();

				CC.screens[0].setCenter(234, 56);

				expect(CC.screens[0].x).toBe(189);
				expect(CC.screens[0].y).toBe(31);

				removeCanvas();

			});

			it("sets the center but dont cross the boundary maxX", function(){

				appendCanvas("canvasId");

				CC.screens = [{
					htmlId: "canvasId",
					w: 100,
					h: 50,
					maxX: 180
				}];

				CC.loadScreens();

				CC.screens[0].setCenter(234, 56);

				expect(CC.screens[0].x).toBe(180);
				expect(CC.screens[0].y).toBe(31);

				removeCanvas();

			});

			it("sets the center but dont cross the boundary minY", function(){

				appendCanvas("canvasId");

				CC.screens = [{
					htmlId: "canvasId",
					w: 100,
					h: 50,
					minY: 37
				}];

				CC.loadScreens();

				CC.screens[0].setCenter(234, 56);

				expect(CC.screens[0].x).toBe(184);
				expect(CC.screens[0].y).toBe(37);

				removeCanvas();

			});

			it("sets the center but dont cross the boundary minX", function(){

				appendCanvas("canvasId");

				CC.screens = [{
					htmlId: "canvasId",
					w: 100,
					h: 50,
					maxY: 28
				}];

				CC.loadScreens();

				CC.screens[0].setCenter(234, 56);

				expect(CC.screens[0].x).toBe(184);
				expect(CC.screens[0].y).toBe(28);

				removeCanvas();

			});

		});

	});

	describe("canvas event handlers", function(){

		it("binds OnSelectStart", function(){

			var canvas = appendCanvas("canvasId");

			CC.screens = [{
				htmlId: "canvasId"
			}];

			CC.loadScreens();

			expect(canvas.onselectstart()).toBe(false);

			removeCanvas();

		});

		it("binds OnClick", function(){

			var triggered = false;

			CC.bind("click", function(){
				triggered = true;
			});

			var canvas = appendCanvas("canvasId");

			CC.screens = [{
				htmlId: "canvasId"
			}];

			CC.loadScreens();

			canvas.onclick();

			expect(triggered).toBe(true);

			removeCanvas();

		});

		it("binds OnContextMenu", function(){

			var triggered = false;

			CC.bind("rightclick", function(){
				triggered = true;
			});

			var canvas = appendCanvas("canvasId");

			CC.screens = [{
				htmlId: "canvasId"
			}];

			CC.loadScreens();

			canvas.oncontextmenu();

			expect(triggered).toBe(true);

			removeCanvas();

		});

	});

	describe("draw", function(){

		var ctx;

		beforeEach(function(){
			appendCanvas("CascadeCanvas");
			CC.loadScreens();
			ctx = CC.screens[0].context;
		});

		afterEach(function(){
			removeCanvas();
			CC.screens = [];
			ctx = null;
			CC.clear();
		});

		it("calls clearrect", function(){
			spyOn(ctx, "clearRect");

			CC.screens[0].w = 300;
			CC.screens[0].h = 100;

			CC.draw();

			expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 300, 100);
		});

		describe("with a single element", function(){

			var el;
			var layers;
			var gradient = { addColorStop: function(){} };

			beforeEach(function(){
				el = CC.new("#El", {x: 1, y: 1, w: 10, h: 10});
				el.layers = {};
				layers = el.layers;
				spyOn(ctx, "save");
				spyOn(ctx, "translate");
				spyOn(ctx, "rotate");
				spyOn(ctx, "measureText")
					.andReturn({width: 30});
				spyOn(ctx, "scale");
				spyOn(ctx, "fillRect");
				spyOn(ctx, "fill");
				spyOn(ctx, "fillText");
				spyOn(ctx, "strokeRect");
				spyOn(ctx, "stroke");
				spyOn(ctx, "strokeText");
				spyOn(ctx, "drawImage");
				spyOn(ctx, "beginPath");
				spyOn(ctx, "arc");
				spyOn(ctx, "closePath");
				spyOn(ctx, "moveTo");
				spyOn(ctx, "lineTo");
				spyOn(gradient, "addColorStop");
				spyOn(ctx, "createLinearGradient")
					.andReturn(gradient);
				spyOn(ctx, "createRadialGradient")
					.andReturn(gradient);
				spyOn(ctx, "quadraticCurveTo");
				spyOn(ctx, "clip");
				spyOn(ctx, "restore");

				var pathTextName = null;
				if (ctx.pathText) pathTextName = "pathText";
				else if (ctx.webkitPathText) pathTextName = "webkitPathText";
				else if (ctx.mozPathText) pathTextName = "mozPathText";
				else if (ctx.oPathText) pathTextName = "oPathText";
				else if (ctx.msPathText) pathTextName = "msPathText";

				if (pathTextName != null) {
					spyOn(ctx, pathTextName);
				}
			});

			it("dont draw anything if the el has no layers", function(){

				CC.draw();

				expect(ctx.save).not.toHaveBeenCalled();

			});

			it("doesnt draw if the element is hidden", function(){

				el.hidden = true;

				layers.uniq = {};

				CC.draw();

				expect(ctx.save).not.toHaveBeenCalled();

			});

			it("calls the layer function", function(){

				var triggered = false;

				layers.uniq = function(){
					triggered = true;
				};

				CC.draw();

				expect(triggered).toBe(true);

				expect(ctx.save).not.toHaveBeenCalled();

			});

			it("tries to draw a empty layer", function(){

				layers.uniq = {};

				CC.draw();

				expect(ctx.save).toHaveBeenCalled();

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("doesnt draw a hidden layer", function(){

				layers.uniq = { hidden: true };

				CC.draw();

				expect(ctx.save).not.toHaveBeenCalled();

			});

			it("setup a text if the shape is text and have a text", function(){

				layers.uniq = { shape: "text", text: "hey" };

				CC.draw();

				expect(layers.uniq.font.style).toBe("");
			    expect(layers.uniq.font.weight).toBe("");
			    expect(layers.uniq.font.size).toBe(10);
			    expect(layers.uniq.font.family).toBe("sans-serif");
			    expect(layers.uniq.font.baseline).toBe("top");

				expect(ctx.save).toHaveBeenCalled();

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("doesnt mess with predefined font config", function(){

				layers.uniq = { shape: "text", text: "hey", font: { style: "italic" } };

				CC.draw();

				expect(layers.uniq.font.style).toBe("italic");
			    expect(layers.uniq.font.weight).toBe("");
			    expect(layers.uniq.font.size).toBe(10);
			    expect(layers.uniq.font.family).toBe("sans-serif");
			    expect(layers.uniq.font.baseline).toBe("top");

				expect(ctx.save).toHaveBeenCalled();

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("finds out w and h of the font if we dont know it", function(){

				delete el.w;
				delete el.h;

				layers.uniq = { shape: "text", text: "hey", font: { style: "italic" } };

				CC.draw();

				expect(ctx.font).toBe("italic  10px sans-serif");

				expect(ctx.save).toHaveBeenCalled();
				expect(ctx.measureText).toHaveBeenCalled();

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("doesnt draw if is out of screen range", function(){

				el.x = -20;

				layers.uniq = { shape: "text" };

				CC.draw();

				expect(ctx.save).not.toHaveBeenCalled();

			});

			it("draws if el is fixedOnScreen and the screen is far from origin", function(){

				el.x = 10;
				el.fixedOnScreen = true;

				CC.screens[0].x = 300;

				layers.uniq = { shape: "text" };

				CC.draw();

				expect(ctx.save).toHaveBeenCalled();

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("doesnt draw if el is not fixedOnScreen and the screen is far from origin", function(){

				el.x = 10;

				CC.screens[0].x = 300;

				layers.uniq = { shape: "text" };

				CC.draw();

				expect(ctx.save).not.toHaveBeenCalled();

			});

			it("rotates the element if it has an angle and set a new anchor", function(){

				el.angle = 30;

				layers.uniq = { shape: "text" };

				CC.draw();

				expect(el.anchor.x).toBe(5);
				expect(el.anchor.y).toBe(5);

				expect(ctx.save).toHaveBeenCalled();
				expect(ctx.rotate).toHaveBeenCalled();

				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("rotates the element if it has an angle and keeps the defined anchor", function(){

				el.angle = 30;
				el.anchor = { x: 3, y: 2 };

				layers.uniq = { shape: "text" };

				CC.draw();

				expect(el.anchor.x).toBe(3);
				expect(el.anchor.y).toBe(2);

				expect(ctx.save).toHaveBeenCalled();
				expect(ctx.rotate).toHaveBeenCalled();

				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("rotates the layer if it has an angle and set a new anchor", function(){

				layers.uniq = { shape: "text", angle: 30 };

				CC.draw();

				expect(layers.uniq.anchor.x).toBe(5);
				expect(layers.uniq.anchor.y).toBe(5);

				expect(ctx.save).toHaveBeenCalled();
				expect(ctx.rotate).toHaveBeenCalled();

				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("rotates the layer if it has an angle and keeps the defined anchor", function(){

				layers.uniq = { shape: "text", angle: 30, anchor: { x: 3, y: 2 } };

				CC.draw();

				expect(layers.uniq.anchor.x).toBe(3);
				expect(layers.uniq.anchor.y).toBe(2);

				expect(ctx.save).toHaveBeenCalled();
				expect(ctx.rotate).toHaveBeenCalled();

				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("flips the element horizontally if flip is x", function(){

				el.flip = "x";
				layers.uniq = { shape: "text" };

				CC.draw();

				expect(ctx.save).toHaveBeenCalled();
				expect(ctx.scale).toHaveBeenCalledWith(-1, 1);

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("flips the element vertically if flip is y", function(){

				el.flip = "y";
				layers.uniq = { shape: "text" };

				CC.draw();

				expect(ctx.save).toHaveBeenCalled();
				expect(ctx.scale).toHaveBeenCalledWith(1, -1);

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("flips the element horizontally and vertically if flip is xy", function(){

				el.flip = "xy";
				layers.uniq = { shape: "text" };

				CC.draw();

				expect(ctx.save).toHaveBeenCalled();
				expect(ctx.scale).toHaveBeenCalledWith(-1, -1);

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("doesnt flips the element if flip doest have x or y", function(){

				el.flip = "ab";
				layers.uniq = { shape: "text" };

				CC.draw();

				expect(ctx.save).toHaveBeenCalled();
				expect(ctx.scale).toHaveBeenCalledWith(1, 1);

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("flips the layer horizontally if flip is x", function(){

				layers.uniq = { shape: "text", flip: "x" };

				CC.draw();

				expect(ctx.save).toHaveBeenCalled();
				expect(ctx.scale).toHaveBeenCalledWith(-1, 1);

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("flips the layer vertically if flip is y", function(){

				layers.uniq = { shape: "text", flip: "y" };

				CC.draw();

				expect(ctx.save).toHaveBeenCalled();
				expect(ctx.scale).toHaveBeenCalledWith(1, -1);

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("flips the layer horizontally and vertically if flip is xy", function(){

				layers.uniq = { shape: "text", flip: "xy" };

				CC.draw();

				expect(ctx.save).toHaveBeenCalled();
				expect(ctx.scale).toHaveBeenCalledWith(-1, -1);

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("doesnt flips the layer if flip doest have x or y", function(){

				layers.uniq = { shape: "text", flip: "ab" };

				CC.draw();

				expect(ctx.save).toHaveBeenCalled();
				expect(ctx.scale).toHaveBeenCalledWith(1, 1);

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("scales the layer", function(){

				layers.uniq = { shape: "text", scale: { x: 3, y: 0.5 } };

				CC.draw();

				expect(ctx.save).toHaveBeenCalled();
				expect(ctx.scale).toHaveBeenCalledWith(3, 0.5);

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("scales the layer only horizontally if x scale wasnt declared", function(){

				layers.uniq = { shape: "text", scale: { x: 2 } };

				CC.draw();

				expect(ctx.save).toHaveBeenCalled();
				expect(ctx.scale).toHaveBeenCalledWith(2, 1);

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("scales the layer only vertically if x scale wasnt declared", function(){

				layers.uniq = { shape: "text", scale: { y: 2 } };

				CC.draw();

				expect(ctx.save).toHaveBeenCalled();
				expect(ctx.scale).toHaveBeenCalledWith(1, 2);

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("sets the context alpha", function(){

				layers.uniq = { shape: "text", alpha: 0.5 };

				CC.draw();

				expect(ctx.globalAlpha).toBe(0.5);

				expect(ctx.save).toHaveBeenCalled();

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalledWith();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("sets an empty context shadow", function(){

				layers.uniq = { shape: "text", shadow: {  } };

				CC.draw();

				expect(ctx.shadowOffsetX).toBe(0);
				expect(ctx.shadowOffsetY).toBe(0);
				expect(ctx.shadowBlur).toBe(0);
				expect(ctx.shadowColor).toBe("rgba(0, 0, 0, 0.0)");

				expect(ctx.save).toHaveBeenCalled();

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalledWith();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("sets the context shadow", function(){

				layers.uniq = { shape: "text", shadow: { x: 1, y: 3, blur: 3, color: "#000000" } };

				CC.draw();

				expect(ctx.shadowOffsetX).toBe(1);
				expect(ctx.shadowOffsetY).toBe(3);
				expect(ctx.shadowBlur).toBe(3);
				expect(ctx.shadowColor).toBe("#000000");

				expect(ctx.save).toHaveBeenCalled();

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalledWith();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("doesnt fill the text if 'fill' is empty", function(){

				layers.uniq = { 
					shape: "text", 
					text: "heey!",
					fill: { } 
				};

				CC.draw();

				expect(ctx.font).toBe("  10px sans-serif");
	            expect(ctx.textBaseline).toBe("top");

				expect(ctx.save).toHaveBeenCalled();
				expect(ctx.fillStyle).toBe("#000000");
				expect(ctx.fillText).toHaveBeenCalledWith("heey!", 0, 0);

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalledWith();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("fills the text with color", function(){

				layers.uniq = { 
					shape: "text", 
					text: "heey!",
					fill: { color: "#ff0000" } 
				};

				CC.draw();

				expect(ctx.font).toBe("  10px sans-serif");
	            expect(ctx.textBaseline).toBe("top");

				expect(ctx.save).toHaveBeenCalled();
				expect(ctx.fillStyle).toBe("#ff0000");
				expect(ctx.fillText).toHaveBeenCalledWith("heey!", 0, 0);

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalledWith();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("fills the text with empty linear gradient", function(){

				layers.uniq = { 
					shape: "text",  
					text: "heey!",
					fill: { 
						linearGradient: {  } 
					} 
				};

				CC.draw();

				expect(ctx.font).toBe("  10px sans-serif");
	            expect(ctx.textBaseline).toBe("top");

				expect(ctx.save).toHaveBeenCalled();
				expect(ctx.createLinearGradient).toHaveBeenCalledWith(0, 0, 10, 0);
				expect(gradient.addColorStop).not.toHaveBeenCalled();
				expect(ctx.fillText).toHaveBeenCalledWith("heey!", 0, 0);

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalledWith();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("fills the text with linear gradient", function(){

				layers.uniq = { 
					shape: "text",  
					text: "heey!",
					fill: { 
						linearGradient: {
							start: [20, 10],
							end: [80, 60],
							0: "#000000",
							0.5: "rgb(255, 255, 255)",
							1: "#ff0000"
						} 
					} 
				};

				CC.draw();

				expect(ctx.font).toBe("  10px sans-serif");
	            expect(ctx.textBaseline).toBe("top");

				expect(ctx.save).toHaveBeenCalled();
				expect(ctx.createLinearGradient).toHaveBeenCalledWith(2, 1, 8, 6);
				expect(gradient.addColorStop).toHaveBeenCalledWith(0, "#000000");
				expect(gradient.addColorStop).toHaveBeenCalledWith(0.5, "rgb(255, 255, 255)");
				expect(gradient.addColorStop).toHaveBeenCalledWith(1, "#ff0000");
				expect(ctx.fillText).toHaveBeenCalledWith("heey!", 0, 0);

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalledWith();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("fills the text with empty radial gradient", function(){

				layers.uniq = { 
					shape: "text",  
					text: "heey!",
					fill: { 
						radialGradient: { } 
					} 
				};

				CC.draw();

				expect(ctx.font).toBe("  10px sans-serif");
	            expect(ctx.textBaseline).toBe("top");

				expect(ctx.save).toHaveBeenCalled();
				expect(ctx.createRadialGradient).toHaveBeenCalledWith(5, 5, 0, 5, 5, 10);
				expect(gradient.addColorStop).not.toHaveBeenCalled();
				expect(ctx.fillText).toHaveBeenCalledWith("heey!", 0, 0);

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalledWith();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("fills the text with radial gradient", function(){

				layers.uniq = { 
					shape: "text",  
					text: "heey!",
					fill: { 
						radialGradient: {
							innerCircle: {
							   centerX: 25,
							   centerY: 25,
							   radius: 20
							},
							outerCircle: {
							   centerX: 75,
							   centerY: 75,
							   radius: 50
							},
							0: "rgba(200, 100, 100, 0.8)",
							0.5: "#f00",
							1: "#0000dd"
						} 
					} 
				};

				CC.draw();

				expect(ctx.font).toBe("  10px sans-serif");
	            expect(ctx.textBaseline).toBe("top");

				expect(ctx.save).toHaveBeenCalled();
				expect(ctx.createRadialGradient).toHaveBeenCalledWith(2.5, 2.5, 2, 7.5, 7.5, 5);
				expect(gradient.addColorStop).toHaveBeenCalledWith(0, "rgba(200, 100, 100, 0.8)");
				expect(gradient.addColorStop).toHaveBeenCalledWith(0.5, "#f00");
				expect(gradient.addColorStop).toHaveBeenCalledWith(1, "#0000dd");
				expect(ctx.fillText).toHaveBeenCalledWith("heey!", 0, 0);

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalledWith();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("doesnt draw stroke of the text if 'stroke' is empty", function(){

				layers.uniq = { 
					shape: "text", 
					text: "heey!",
					stroke: { } 
				};

				CC.draw();

				expect(ctx.font).toBe("  10px sans-serif");
	            expect(ctx.textBaseline).toBe("top");

				expect(ctx.save).toHaveBeenCalled();
				expect(ctx.strokeStyle).toBe("#000000");
				expect(ctx.strokeText).toHaveBeenCalledWith("heey!", 0, 0);

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalledWith();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("draws stroke of the text with color", function(){

				layers.uniq = { 
					shape: "text", 
					text: "heey!",
					stroke: { color: "#ff0000" } 
				};

				CC.draw();

				expect(ctx.font).toBe("  10px sans-serif");
	            expect(ctx.textBaseline).toBe("top");

				expect(ctx.save).toHaveBeenCalled();
				expect(ctx.strokeStyle).toBe("#ff0000");
				expect(ctx.strokeText).toHaveBeenCalledWith("heey!", 0, 0);

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalledWith();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("draws stroke of the text with empty linear gradient", function(){

				layers.uniq = { 
					shape: "text",  
					text: "heey!",
					stroke: { 
						linearGradient: {  } 
					} 
				};

				CC.draw();

				expect(ctx.font).toBe("  10px sans-serif");
	            expect(ctx.textBaseline).toBe("top");

				expect(ctx.save).toHaveBeenCalled();
				expect(ctx.createLinearGradient).toHaveBeenCalledWith(0, 0, 10, 0);
				expect(gradient.addColorStop).not.toHaveBeenCalled();
				expect(ctx.strokeText).toHaveBeenCalledWith("heey!", 0, 0);

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalledWith();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("draws stroke of the text with linear gradient", function(){

				layers.uniq = { 
					shape: "text",  
					text: "heey!",
					stroke: { 
						linearGradient: {
							start: [20, 10],
							end: [80, 60],
							0: "#000000",
							0.5: "rgb(255, 255, 255)",
							1: "#ff0000"
						} 
					} 
				};

				CC.draw();

				expect(ctx.font).toBe("  10px sans-serif");
	            expect(ctx.textBaseline).toBe("top");

				expect(ctx.save).toHaveBeenCalled();
				expect(ctx.createLinearGradient).toHaveBeenCalledWith(2, 1, 8, 6);
				expect(gradient.addColorStop).toHaveBeenCalledWith(0, "#000000");
				expect(gradient.addColorStop).toHaveBeenCalledWith(0.5, "rgb(255, 255, 255)");
				expect(gradient.addColorStop).toHaveBeenCalledWith(1, "#ff0000");
				expect(ctx.strokeText).toHaveBeenCalledWith("heey!", 0, 0);

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalledWith();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("draws stroke of the text with empty radial gradient", function(){

				layers.uniq = { 
					shape: "text",  
					text: "heey!",
					stroke: { 
						radialGradient: { } 
					} 
				};

				CC.draw();

				expect(ctx.font).toBe("  10px sans-serif");
	            expect(ctx.textBaseline).toBe("top");

				expect(ctx.save).toHaveBeenCalled();
				expect(ctx.createRadialGradient).toHaveBeenCalledWith(5, 5, 0, 5, 5, 10);
				expect(gradient.addColorStop).not.toHaveBeenCalled();
				expect(ctx.strokeText).toHaveBeenCalledWith("heey!", 0, 0);

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalledWith();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("draws stroke of the text with radial gradient", function(){

				layers.uniq = { 
					shape: "text",  
					text: "heey!",
					stroke: { 
						radialGradient: {
							innerCircle: {
							   centerX: 25,
							   centerY: 25,
							   radius: 20
							},
							outerCircle: {
							   centerX: 75,
							   centerY: 75,
							   radius: 50
							},
							0: "rgba(200, 100, 100, 0.8)",
							0.5: "#f00",
							1: "#0000dd"
						} 
					} 
				};

				CC.draw();

				expect(ctx.font).toBe("  10px sans-serif");
	            expect(ctx.textBaseline).toBe("top");

				expect(ctx.save).toHaveBeenCalled();
				expect(ctx.createRadialGradient).toHaveBeenCalledWith(2.5, 2.5, 2, 7.5, 7.5, 5);
				expect(gradient.addColorStop).toHaveBeenCalledWith(0, "rgba(200, 100, 100, 0.8)");
				expect(gradient.addColorStop).toHaveBeenCalledWith(0.5, "#f00");
				expect(gradient.addColorStop).toHaveBeenCalledWith(1, "#0000dd");
				expect(ctx.strokeText).toHaveBeenCalledWith("heey!", 0, 0);

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalledWith();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

/*
        ########              ########
      ##        ##          ##        ##
	 #            #        #            #


                   ##    ##
          ###                    ###
           #                      #
            #                    #
             ##                ##
               ################


@melanke - 30/01/2014
*/


			it("setup and fill a polygon if the shape is an array", function(){

				delete el.w;
				delete el.h;

				layers.uniq = { 
					shape: [ ],
					fill: { color: "#ff0000" } 
				};

				CC.draw();

				expect(ctx.fill).toHaveBeenCalled();
				expect(ctx.save).toHaveBeenCalled();

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("setup and fill a polygon", function(){

				delete el.w;
				delete el.h;

				layers.uniq = { 
					shape: [
						[40, 50], [70, 60], [20, 30], [90, 80]
					],
					fill: { color: "#ff0000" } 
				};

				CC.draw();

				expect(ctx.fillStyle).toBe("#ff0000");

				expect(ctx.beginPath).toHaveBeenCalled();
				expect(ctx.moveTo).toHaveBeenCalledWith(40, 50);
				expect(ctx.lineTo).toHaveBeenCalledWith(70, 60);
				expect(ctx.lineTo).toHaveBeenCalledWith(20, 30);
				expect(ctx.lineTo).toHaveBeenCalledWith(90, 80);
				expect(ctx.closePath).toHaveBeenCalled();
				expect(ctx.fill).toHaveBeenCalled();

				expect(ctx.save).toHaveBeenCalled();

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("setup and stroke a polygon if the shape is an array", function(){

				delete el.w;
				delete el.h;

				layers.uniq = { 
					shape: [ ],
					stroke: { color: "#ff0000" } 
				};

				CC.draw();

				expect(ctx.stroke).toHaveBeenCalled();
				expect(ctx.save).toHaveBeenCalled();

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("setup and stroke a polygon", function(){

				delete el.w;
				delete el.h;

				layers.uniq = { 
					shape: [
						[40, 50], [70, 60], [20, 30], [90, 80]
					],
					stroke: { color: "#ff0000" } 
				};

				CC.draw();

				expect(ctx.strokeStyle).toBe("#ff0000");

				expect(ctx.beginPath).toHaveBeenCalled();
				expect(ctx.moveTo).toHaveBeenCalledWith(40, 50);
				expect(ctx.lineTo).toHaveBeenCalledWith(70, 60);
				expect(ctx.lineTo).toHaveBeenCalledWith(20, 30);
				expect(ctx.lineTo).toHaveBeenCalledWith(90, 80);
				expect(ctx.closePath).toHaveBeenCalled();
				expect(ctx.stroke).toHaveBeenCalled();

				expect(ctx.save).toHaveBeenCalled();

				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("setup and fill a rectangle", function(){

				layers.uniq = { 
					shape: "rect",
					fill: { color: "#ff0000" } 
				};

				CC.draw();

				expect(ctx.fillStyle).toBe("#ff0000");
				expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 10, 10);

				expect(ctx.save).toHaveBeenCalled();

				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("setup and fill a rectangle with roundedBorderRadius", function(){

				layers.uniq = { 
					shape: "rect",
					fill: { color: "#ff0000" },
					roundedBorderRadius: 3
				};

				CC.draw();

				expect(ctx.fillStyle).toBe("#ff0000");
				expect(ctx.beginPath).toHaveBeenCalled();
		        expect(ctx.moveTo).toHaveBeenCalledWith(3, 0);
		        expect(ctx.lineTo).toHaveBeenCalledWith(7, 0);
		        expect(ctx.quadraticCurveTo).toHaveBeenCalledWith(10, 0, 10, 3);
		        expect(ctx.lineTo).toHaveBeenCalledWith(10, 7);
		        expect(ctx.quadraticCurveTo).toHaveBeenCalledWith(10, 10, 7, 10);
		        expect(ctx.lineTo).toHaveBeenCalledWith(3, 10);
		        expect(ctx.quadraticCurveTo).toHaveBeenCalledWith(0, 10, 0, 7);
		        expect(ctx.lineTo).toHaveBeenCalledWith(0, 3);
		        expect(ctx.quadraticCurveTo).toHaveBeenCalledWith(0, 0, 3, 0);
		        expect(ctx.closePath).toHaveBeenCalled();
				expect(ctx.fill).toHaveBeenCalled();

				expect(ctx.save).toHaveBeenCalled();

				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("setup and stroke a rectangle", function(){

				layers.uniq = { 
					shape: "rect",
					stroke: { color: "#ff0000" } 
				};

				CC.draw();

				expect(ctx.strokeStyle).toBe("#ff0000");
				expect(ctx.strokeRect).toHaveBeenCalledWith(0, 0, 10, 10);

				expect(ctx.save).toHaveBeenCalled();

				expect(ctx.beginPath).not.toHaveBeenCalled();
				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.closePath).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("setup and stroke a rectangle with roundedBorderRadius", function(){

				layers.uniq = { 
					shape: "rect",
					stroke: { color: "#ff0000" },
					roundedBorderRadius: 3
				};

				CC.draw();

				expect(ctx.strokeStyle).toBe("#ff0000");
				expect(ctx.beginPath).toHaveBeenCalled();
		        expect(ctx.moveTo).toHaveBeenCalledWith(3, 0);
		        expect(ctx.lineTo).toHaveBeenCalledWith(7, 0);
		        expect(ctx.quadraticCurveTo).toHaveBeenCalledWith(10, 0, 10, 3);
		        expect(ctx.lineTo).toHaveBeenCalledWith(10, 7);
		        expect(ctx.quadraticCurveTo).toHaveBeenCalledWith(10, 10, 7, 10);
		        expect(ctx.lineTo).toHaveBeenCalledWith(3, 10);
		        expect(ctx.quadraticCurveTo).toHaveBeenCalledWith(0, 10, 0, 7);
		        expect(ctx.lineTo).toHaveBeenCalledWith(0, 3);
		        expect(ctx.quadraticCurveTo).toHaveBeenCalledWith(0, 0, 3, 0);
		        expect(ctx.closePath).toHaveBeenCalled();
				expect(ctx.stroke).toHaveBeenCalled();

				expect(ctx.save).toHaveBeenCalled();

				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.arc).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("setup and fill a circle", function(){

				layers.uniq = { 
					shape: "circle",
					fill: { color: "#ff0000" } 
				};

				CC.draw();

				expect(ctx.fillStyle).toBe("#ff0000");
				expect(ctx.fill).toHaveBeenCalled();
				expect(ctx.beginPath).toHaveBeenCalled();
				expect(ctx.arc).toHaveBeenCalledWith(5, 5, 5, 0, 2 * Math.PI);
				expect(ctx.closePath).toHaveBeenCalled();

				expect(ctx.save).toHaveBeenCalled();

				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.stroke).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

			it("setup and stroke a circle", function(){

				layers.uniq = { 
					shape: "circle",
					stroke: { color: "#ff0000" } 
				};

				CC.draw();

				expect(ctx.strokeStyle).toBe("#ff0000");
				expect(ctx.stroke).toHaveBeenCalled();
				expect(ctx.beginPath).toHaveBeenCalled();
				expect(ctx.arc).toHaveBeenCalledWith(5, 5, 5, 0, 2 * Math.PI);
				expect(ctx.closePath).toHaveBeenCalled();

				expect(ctx.save).toHaveBeenCalled();

				expect(ctx.moveTo).not.toHaveBeenCalled();
				expect(ctx.lineTo).not.toHaveBeenCalled();
				expect(ctx.strokeRect).not.toHaveBeenCalled();
				expect(ctx.rotate).not.toHaveBeenCalled();
				expect(ctx.measureText).not.toHaveBeenCalled();
				expect(ctx.scale).not.toHaveBeenCalled();
				expect(ctx.fillText).not.toHaveBeenCalled();
				expect(ctx.fillRect).not.toHaveBeenCalled();
				expect(ctx.fill).not.toHaveBeenCalled();
				expect(ctx.strokeText).not.toHaveBeenCalled();
				expect(ctx.drawImage).not.toHaveBeenCalled();
				expect(ctx.createLinearGradient).not.toHaveBeenCalled();
				expect(ctx.createRadialGradient).not.toHaveBeenCalled();
				expect(ctx.quadraticCurveTo).not.toHaveBeenCalled();
				expect(ctx.clip).not.toHaveBeenCalled();

				expect(ctx.restore).toHaveBeenCalled();

			});

		});

	});
	
});