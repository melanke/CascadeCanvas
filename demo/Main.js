require(["lib/cc.js", "lib/CC.Box2dWeb.js"], function(CC, b2){
//in this example we will use RequireJS, CascadeCanvas and CC.Box2dWeb (physics)

	//loading resources before the start
	CC.loadResources(["res/player.png"], function(){

		//defining a class
		//its instance will be a rectangle with a black and thick stroke and a orange-yellow fill
		CC.def("CuteDraw", function(){

			CC.merge(this.drawings, {
				primeiro: {
					shape: "rect",
					stroke: {
						thickness: 2,
						color: "#000"
					},
					fill: {
						linearGradient: {
	                       start: [0, 0],
	                       end: [100, 0],
	                       "0": "#ff0",
	                       "1": "#f90"
	                   }
					},
					sprite: {
						url: "res/player.png",
						repeat: "y",
						frames: 3,
						delay: 10,
						x: 0,
						y: 64,
						w: 32,
						h: 32
					}
				}
			});

		});

		
		CC.def("MyCircle", function(){

			this.w = 50;
			this.h = 50; //Box2D needs width and height before instantiate

			this.inherit("b2Circle CuteDraw", {
				fixDef: {
					restitution: 0.8
				}
			});

			CC.merge(this.drawings, {
				primeiro: {
					shape: "circle"
				}
			});

			this.onClick(function(){

				if (CC.isKeysPressedOnly("Ctrl")) {

					this.remove();

				}

			});
		});

		CC.new("b2Box CuteDraw", {
			x: 50,
			y: 450,
			w: 700,
			h: 30,
			bodyDef: {
				type: b2.Body.b2_staticBody
			}
		});




		CC.new("#MovingBox b2Box CuteDraw", {
			x: 450,
			y: 250,
			w: 50,
			h: 50,
			fixDef: {
                density: 0.1,
                friction: 0.1,
                restitution: 0.5
			}
		});

		
		var rampArray = [ [0, 0], [10, 50], [30, 100], [60, 150], [100, 200], [150, 250], [200, 290], [250, 320], [300, 340], [350, 350], [0, 350] ];

		CC.new("b2Polygon CuteDraw", {
			x: 50,
			y: 100,
			polygon: rampArray,
			bodyDef: {
				type: b2.Body.b2_staticBody
			}
		}).merge({
			drawings: {
				primeiro: {
					shape: rampArray
				}
			}
		});

		//we put a MyCircle where user clicks
		CC.bind("click", function(e){

			if (CC.isNoKeyPressed()) {

				CC.new("MyCircle", {
					x: e.offsetX - 25 - CC.screen.x,
					y: e.offsetY - 25 - CC.screen.y
				});

			}

		});

		CC.bind("rightclick", function(e){

			if (CC.isNoKeyPressed()) {

				CC.setScreenCenter(e.offsetX - CC.screen.x, e.offsetY - CC.screen.y);

			}

		});

		CC.onKeysDown("right", function(){
			CC("#MovingBox").applyForceWithAngle(50, 0);
		});

		CC.onKeysDown("left", function(){
			CC("#MovingBox").applyForceWithAngle(-50, 0);
		});


		CC.startLoop();	

	});

});