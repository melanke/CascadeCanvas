describe("color", function () {

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

	it("Creating a color by name (red)", function(){

		appendCanvas("CascadeCanvas");
		CC.loadScreens();

		var color = new CC.Color("red");

		expect(color.valid).toBe(true);
		expect(color.str).toBe("red");

		expect(color.rgba[0]).toBe(255);
		expect(color.rgba[1]).toBe(0);
		expect(color.rgba[2]).toBe(0);
		expect(color.rgba[3]).toBe(1);

		expect(color.cmyka[0]).toBe(0);
		expect(color.cmyka[1]).toBe(1);
		expect(color.cmyka[2]).toBe(1);
		expect(color.cmyka[3]).toBe(0);
		expect(color.cmyka[4]).toBe(1);

		expect(color.R).toBe(255);
		expect(color.G).toBe(0);
		expect(color.B).toBe(0);
		expect(color.A).toBe(1);
		expect(color.C).toBe(0);
		expect(color.M).toBe(1);
		expect(color.Y).toBe(1);
		expect(color.K).toBe(0);

		removeCanvas();

	});

	it("Creating a color by name (black)", function(){

		appendCanvas("CascadeCanvas");
		CC.loadScreens();

		var color = new CC.Color("black");

		expect(color.valid).toBe(true);
		expect(color.str).toBe("black");

		expect(color.rgba[0]).toBe(0);
		expect(color.rgba[1]).toBe(0);
		expect(color.rgba[2]).toBe(0);
		expect(color.rgba[3]).toBe(1);

		expect(color.cmyka[0]).toBe(0);
		expect(color.cmyka[1]).toBe(0);
		expect(color.cmyka[2]).toBe(0);
		expect(color.cmyka[3]).toBe(1);
		expect(color.cmyka[4]).toBe(1);

		expect(color.R).toBe(0);
		expect(color.G).toBe(0);
		expect(color.B).toBe(0);
		expect(color.A).toBe(1);
		expect(color.C).toBe(0);
		expect(color.M).toBe(0);
		expect(color.Y).toBe(0);
		expect(color.K).toBe(1);

		removeCanvas();

	});

	it("Creating a color by hash (#0000ff)", function(){

		appendCanvas("CascadeCanvas");
		CC.loadScreens();

		var color = new CC.Color("#0000ff");

		expect(color.valid).toBe(true);
		expect(color.str).toBe("#0000ff");

		expect(color.rgba[0]).toBe(0);
		expect(color.rgba[1]).toBe(0);
		expect(color.rgba[2]).toBe(255);
		expect(color.rgba[3]).toBe(1);

		expect(color.cmyka[0]).toBe(1);
		expect(color.cmyka[1]).toBe(1);
		expect(color.cmyka[2]).toBe(0);
		expect(color.cmyka[3]).toBe(0);
		expect(color.cmyka[4]).toBe(1);

		expect(color.R).toBe(0);
		expect(color.G).toBe(0);
		expect(color.B).toBe(255);
		expect(color.A).toBe(1);
		expect(color.C).toBe(1);
		expect(color.M).toBe(1);
		expect(color.Y).toBe(0);
		expect(color.K).toBe(0);

		removeCanvas();

	});

	it("Creating a color by rgb (0, 255, 0)", function(){

		appendCanvas("CascadeCanvas");
		CC.loadScreens();

		var color = new CC.Color([0, 255, 0]);

		expect(color.valid).toBe(true);
		expect(color.str).toBe("rgba(0, 255, 0, 1)");

		expect(color.rgba[0]).toBe(0);
		expect(color.rgba[1]).toBe(255);
		expect(color.rgba[2]).toBe(0);
		expect(color.rgba[3]).toBe(1);

		expect(color.cmyka[0]).toBe(1);
		expect(color.cmyka[1]).toBe(0);
		expect(color.cmyka[2]).toBe(1);
		expect(color.cmyka[3]).toBe(0);
		expect(color.cmyka[4]).toBe(1);

		expect(color.R).toBe(0);
		expect(color.G).toBe(255);
		expect(color.B).toBe(0);
		expect(color.A).toBe(1);
		expect(color.C).toBe(1);
		expect(color.M).toBe(0);
		expect(color.Y).toBe(1);
		expect(color.K).toBe(0);

		removeCanvas();

	});

	it("Creating a color by rgba (255, 255, 0, 0.5)", function(){

		appendCanvas("CascadeCanvas");
		CC.loadScreens();

		var color = new CC.Color([255, 255, 0, 0.5]);

		expect(color.valid).toBe(true);
		expect(color.str).toBe("rgba(255, 255, 0, 0.5)");

		expect(color.rgba[0]).toBe(255);
		expect(color.rgba[1]).toBe(255);
		expect(color.rgba[2]).toBe(0);
		expect(color.rgba[3]).toBe(0.5);

		expect(color.cmyka[0]).toBe(0);
		expect(color.cmyka[1]).toBe(0);
		expect(color.cmyka[2]).toBe(1);
		expect(color.cmyka[3]).toBe(0);
		expect(color.cmyka[4]).toBe(0.5);

		expect(color.R).toBe(255);
		expect(color.G).toBe(255);
		expect(color.B).toBe(0);
		expect(color.A).toBe(0.5);
		expect(color.C).toBe(0);
		expect(color.M).toBe(0);
		expect(color.Y).toBe(1);
		expect(color.K).toBe(0);

		removeCanvas();

	});

	it("Creating a color by cmyka (1, 0, 0, 0.5, 1)", function(){

		appendCanvas("CascadeCanvas");
		CC.loadScreens();

		var color = new CC.Color([1, 0, 0, 0.5, 1]);

		expect(color.valid).toBe(true);
		expect(color.str).toBe("rgba(1, 128, 128, 1)");

		expect(color.rgba[0]).toBe(1);
		expect(color.rgba[1]).toBe(128);
		expect(color.rgba[2]).toBe(128);
		expect(color.rgba[3]).toBe(1);

		expect(color.cmyka[0]).toBe(1);
		expect(color.cmyka[1]).toBe(0);
		expect(color.cmyka[2]).toBe(0);
		expect(color.cmyka[3]).toBe(0.5);
		expect(color.cmyka[4]).toBe(1);

		expect(color.R).toBe(1);
		expect(color.G).toBe(128);
		expect(color.B).toBe(128);
		expect(color.A).toBe(1);
		expect(color.C).toBe(1);
		expect(color.M).toBe(0);
		expect(color.Y).toBe(0);
		expect(color.K).toBe(0.5);

		removeCanvas();

	});

	it("Mixing colors (red and blue)", function(){

		appendCanvas("CascadeCanvas");
		CC.loadScreens();

		var color = new CC.Color("red").mixWith(new CC.Color("blue"));

		expect(color.valid).toBe(true);
		expect(color.str).toBe("rgba(128, 1, 128, 1)");

		expect(color.rgba[0]).toBe(128);
		expect(color.rgba[1]).toBe(1);
		expect(color.rgba[2]).toBe(128);
		expect(color.rgba[3]).toBe(1);

		expect(color.cmyka[0]).toBe(0.5);
		expect(color.cmyka[1]).toBe(1);
		expect(color.cmyka[2]).toBe(0.5);
		expect(color.cmyka[3]).toBe(0);
		expect(color.cmyka[4]).toBe(1);

		expect(color.R).toBe(128);
		expect(color.G).toBe(1);
		expect(color.B).toBe(128);
		expect(color.A).toBe(1);
		expect(color.C).toBe(0.5);
		expect(color.M).toBe(1);
		expect(color.Y).toBe(0.5);
		expect(color.K).toBe(0);

		removeCanvas();

	});

	it("Mixing colors by 20% (red and blue)", function(){

		appendCanvas("CascadeCanvas");
		CC.loadScreens();

		var color = new CC.Color("red").mixWith(new CC.Color("blue"), 20);

		expect(color.valid).toBe(true);
		expect(color.str).toBe("rgba(205, 1, 51, 1)");

		expect(color.rgba[0]).toBe(205);
		expect(color.rgba[1]).toBe(1);
		expect(color.rgba[2]).toBe(51);
		expect(color.rgba[3]).toBe(1);

		expect(color.cmyka[0]).toBe(0.2);
		expect(color.cmyka[1]).toBe(1);
		expect(color.cmyka[2]).toBe(0.8);
		expect(color.cmyka[3]).toBe(0);
		expect(color.cmyka[4]).toBe(1);

		expect(color.R).toBe(205);
		expect(color.G).toBe(1);
		expect(color.B).toBe(51);
		expect(color.A).toBe(1);
		expect(color.C).toBe(0.2);
		expect(color.M).toBe(1);
		expect(color.Y).toBe(0.8);
		expect(color.K).toBe(0);

		removeCanvas();

	});

	it("Creating a invalid color", function(){

		appendCanvas("CascadeCanvas");
		CC.loadScreens();

		var color = new CC.Color();

		expect(color.valid).toBe(false);

		removeCanvas();

	});

});