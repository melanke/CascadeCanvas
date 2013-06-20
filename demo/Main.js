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
						x: 0,
						y: 0,
						w: 32,
						h: 48
					}
				}
			});

		});

		
		CC.def("MyCircle", function(){

			this.w = 50;
			this.h = 50; //Box2D needs width and height before instantiate

			this.inherit("b2CircleShape CuteDraw", {
				fixDef: {
					restitution: 0.8
				}
			});

			CC.merge(this.drawings, {
				primeiro: {
					shape: "circle"
				}
			});
		});

		CC.new("b2Box CuteDraw", {
			x: 50,
			y: 420,
			w: 700,
			h: 30,
			bodyDef: {
				type: b2.Body.b2_staticBody
			}
		});

		//triangle
		CC.new("CuteDraw", {
			x: 10,
			y: 10,
			w: 50,
			h: 50
		}).merge({
			drawings: {
				primeiro: {
					shape: [ [0, 0], [50, 0], [0, 50] ]
				}
			}
		});

		//we put a MyCircle where user clicks
		document.getElementById("CascadeCanvas").onclick = function(e){

			CC.new("MyCircle", {
				x: e.offsetX - 25,
				y: e.offsetY - 25
			});

		};


		CC.startLoop();	

	});

});