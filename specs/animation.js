describe("animation", function () {

	it("runs a simple animation", function(){

		var steps = [];

		runs(function(){

			CC.startLoop();

			var an = new CC.Animation(function(step){

				steps.push(step);

				if (step == 3) {
					return false;
				}

			});

			an.start();

		});

		waits(100);

		runs(function(){

			CC.stopLoop();
			expect(steps.length).toBe(4);
			expect(steps[0]).toBe(0);
			expect(steps[1]).toBe(1);
			expect(steps[2]).toBe(2);
			expect(steps[3]).toBe(3);

		});

	});


	it("runs a pct animation", function(){

		var steps = [];

		runs(function(){

			CC.startLoop();

			var an = new CC.Animation(function(pct){

				steps.push(pct);

			}, 5);

			an.start();

		});

		waits(100);

		runs(function(){

			CC.stopLoop();
			expect(steps.length).toBe(5);
			expect(steps[0]).toBe(0);
			expect(steps[1]).toBe(20);
			expect(steps[2]).toBe(40);
			expect(steps[3]).toBe(60);
			expect(steps[4]).toBe(80);

		});

	});


	it("runs 2 animations at the same time", function(){

		var steps = [];

		runs(function(){

			CC.startLoop();

			var an = new CC.Animation([function(pct){

				steps.push(pct);

			}, function(pct){

				steps.push(pct+1);

			}], 5);

			an.start();

		});

		waits(100);

		runs(function(){

			CC.stopLoop();
			expect(steps.length).toBe(10);
			expect(steps[0]).toBe(0);
			expect(steps[1]).toBe(1);
			expect(steps[2]).toBe(20);
			expect(steps[3]).toBe(21);
			expect(steps[4]).toBe(40);
			expect(steps[5]).toBe(41);
			expect(steps[6]).toBe(60);
			expect(steps[7]).toBe(61);
			expect(steps[8]).toBe(80);
			expect(steps[9]).toBe(81);

		});

	});

	it("arguments to the animation", function(){

		var steps = [];

		runs(function(){

			CC.startLoop();

			var an = new CC.Animation(function(step, param){

				steps.push(step+param.plus);

				if (step == 3) {
					return false;
				}

			}, {
				plus: 3
			});

			an.start();

		});

		waits(100);

		runs(function(){

			CC.stopLoop();
			expect(steps.length).toBe(4);
			expect(steps[0]).toBe(3);
			expect(steps[1]).toBe(4);
			expect(steps[2]).toBe(5);
			expect(steps[3]).toBe(6);

		});

	});


	it("an animation after another", function(){

		var steps = [];

		runs(function(){

			CC.startLoop();

			var an1 = new CC.Animation(function(pct){

				steps.push(pct);

			}, 5);

			var an2 = new CC.Animation(function(pct){

				steps.push(pct);

			}, 5);

			an1.then(function(){

				an2.start();
			});

			an1.start();

		});

		waits(200);

		runs(function(){

			CC.stopLoop();
			expect(steps.length).toBe(10);
			expect(steps[0]).toBe(0);
			expect(steps[1]).toBe(20);
			expect(steps[2]).toBe(40);
			expect(steps[3]).toBe(60);
			expect(steps[4]).toBe(80);
			expect(steps[5]).toBe(0);
			expect(steps[6]).toBe(20);
			expect(steps[7]).toBe(40);
			expect(steps[8]).toBe(60);
			expect(steps[9]).toBe(80);

		});

	});


// 	it("runs a simple animation", function(){

// 		var steps = [];

// 		runs(function(){

// 			CC.startLoop();

// 			CC.animation(function(step){

// 				steps.push(step);

// 				if (step == 3) {
// 					return true;
// 				}

// 			}, true);

// 		});

// 		waits(100);

// 		runs(function(){

// 			CC.stopLoop();
// 			expect(steps.length).toBe(4);
// 			expect(steps[0]).toBe(0);
// 			expect(steps[1]).toBe(1);
// 			expect(steps[2]).toBe(2);
// 			expect(steps[3]).toBe(3);

// 		});

// 	});

// 	it("creates the animation and then runs it", function(){

// 		var steps = [];

// 		CC.startLoop();

// 		var animation = CC.animation(function(step, sum){

// 			steps.push(step+sum);

// 			if (step == 3) {
// 				return true;
// 			}

// 		});

// 		runs(function(){
// 			animation(3);
// 		});

// 		waits(100);

// 		runs(function(){

// 			CC.stopLoop();
// 			expect(steps.length).toBe(4);
// 			expect(steps[0]).toBe(3);
// 			expect(steps[1]).toBe(4);
// 			expect(steps[2]).toBe(5);
// 			expect(steps[3]).toBe(6);

// 		});

// 	});

// 	it("runs a pct animation", function(){

// 		var steps = [];

// 		runs(function(){

// 			CC.startLoop();

// 			CC.pctAnimation(function(pct){

// 				steps.push(pct);

// 			}, 5);

// 		});

// 		waits(100);

// 		runs(function(){

// 			CC.stopLoop();
// 			expect(steps.length).toBe(5);
// 			expect(steps[0]).toBe(0);
// 			expect(steps[1]).toBe(20);
// 			expect(steps[2]).toBe(40);
// 			expect(steps[3]).toBe(60);
// 			expect(steps[4]).toBe(80);

// 		});

// 	});

// 	it("creates the pct animation and then runs it", function(){

// 		var steps = [];

// 		CC.startLoop();

// 		var animation = CC.pctAnimation(function(pct, sum){

// 			steps.push(pct+sum);

// 		});

// 		runs(function(){
// 			animation(5, 2);
// 		});

// 		waits(100);

// 		runs(function(){

// 			CC.stopLoop();
// 			expect(steps.length).toBe(5);
// 			expect(steps[0]).toBe(2);
// 			expect(steps[1]).toBe(22);
// 			expect(steps[2]).toBe(42);
// 			expect(steps[3]).toBe(62);
// 			expect(steps[4]).toBe(82);

// 		});

// 	});

});