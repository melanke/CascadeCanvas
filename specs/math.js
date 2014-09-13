describe("math.js", function(){

	describe("rotatePoint", function(){

		it("rotate 45 degrees", function(){

			var point = [100, 100];
			var anchor = [0, 100];
			var angle = 45;
			var result = CC.rotatePoint(point, anchor, angle);
			var expected = {
				x: 71,
				y: 29
			};

			expect(result).toEqual(expected);

		});

		it("rotate 90 degrees", function(){

			var point = {x: 100, y: 100};
			var anchor = {x: 0, y: 100};
			var angle = 90;
			var result = CC.rotatePoint(point, anchor, angle);
			var expected = {
				x: 0,
				y: 0
			};

			expect(result).toEqual(expected);

		});

		it("rotate -30 degrees", function(){

			var point = [100, 100];
			var anchor = {x: 0, y: 100};
			var angle = -30;
			var result = CC.rotatePoint(point, anchor, angle);
			var expected = {
				x: 87,
				y: 150
			};

			expect(result).toEqual(expected);

		});

	});

	describe("calcAngle", function(){

		it("its 45 degrees", function(){

			var p1 = [0, 100];
			var p2 = [71, 29];
			var expected = 45;
			var result = CC.calcAngleDegrees(p1, p2);

			expect(result).toEqual(expected);

		});

		it("its 90 degrees", function(){

			var p1 = [0, 100];
			var p2 = [0, 0];
			var expected = 90;
			var result = CC.calcAngleDegrees(p1, p2);

			expect(result).toEqual(expected);

		});

		it("its -30 degrees", function(){

			var p1 = [0, 100];
			var p2 = [87, 150];
			var expected = -29.886526940424034;
			var result = CC.calcAngleDegrees(p1, p2);

			expect(result).toEqual(expected);

		});

	});

	describe("calcDistance", function(){

		it("calculates the distance of two points", function(){

			var p1 = [0, 100];
			var p2 = [87, 150];
			var expected = 100.34440691936945;
			var result = CC.calcDistance(p1, p2);

			expect(result).toEqual(expected);

		});

	});

	describe("generalFormEqOfLine", function(){

		it("calculates the general form equation of line", function(){

			var p1 = [0, 100];
			var p2 = [87, 150];
			var expected = {
				a : -50, 
				b : 87, 
				c : -8700
			};

			var result = CC.generalFormEqOfLine(p1, p2);

			expect(result).toEqual(expected);

		});

	});

	describe("calcLineDistance", function(){

		it("calculates the distance (0) of point to line", function(){

			var p = [0, 100];
			var line = {
				a : -50, 
				b : 87, 
				c : -8700
			};
			var expected = 0;

			var result = CC.calcLineDistance(line, p);

			expect(result).toEqual(expected);

		});

		it("calculates a real distance of point to line", function(){

			var p = [20, 50];
			var line = {
				a : -50, 
				b : 87, 
				c : -8700
			};
			var expected = 53.31637471632005;

			var result = CC.calcLineDistance(line, p);

			expect(result).toEqual(expected);

		});

	});

	describe("calcCenterOfPoints", function(){

		it("calculates the center point of an array of points", function(){

			var points = [
				[0, 100],
				[87, 150],
				[120, 60],
				[37, 180]
			];

			var expected = {
				x : 60, 
				y : 120
			};

			var result = CC.calcCenterOfPoints(points);

			expect(result).toEqual(expected);

		});

	});

});