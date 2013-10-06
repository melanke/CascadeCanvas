describe("promise.js", function(){

	var passFowardSyncly = function(value) {
	    var p = new CC.Promise();
	    p.done(value);
	    return p;
	};

	var passFowardAsyncly = function(value) {
	    var p = new CC.Promise();
	    setTimeout(function(){
	        p.done(value);
	    });
	    return p;
	};

	var passFowardLate = function(n) {
	    var p = new CC.Promise();
	    setTimeout(function() {
	        p.done(n, n+1);
	    }, n);
	    return p;
	};

	it("receive callback with the sent result when synchronous", function(){

		var result;

		passFowardSyncly(123).then(function(_result) {
	        result = _result;
	    });

	    expect(result).toBe(123);

	});

	it("receive callback with the sent result when asynchronous", function(){

		var result;

		runs(function(){
			passFowardAsyncly(123).then(function(_result) {
		        result = _result;
		    });
		});

		waits(100);

		runs(function(){
	    	expect(result).toBe(123);
	    });

	});

	it("receive all callbacks with the sent results", function(){

		var res, a, b, c;

		runs(function(){
			p = new CC.Promise();

		    p.then(function (_res, _a, _b, _c) {
                a = _a;
            });

		    setTimeout(function () {
		        p.then(function (_res, _a, _b, _c) {
		            b = _b;
		        });

		        p.done(null, 1, 2, 3);

		        p.then(function (_res, _a, _b, _c) {
		            c = _c;
		        });
		    });
		});

		waits(100);

		runs(function(){
	    	expect(a).toBe(1);
	    	expect(b).toBe(2);
	    	expect(c).toBe(3);
	    });

	});

	it("join promises", function(){

		var start = new Date();
		var delay, a, b;

		runs(function(){
			CC.promiseJoin([passFowardLate(400), passFowardLate(800)]).then(function(_a, _b) {
	            delay = new Date() - start;
	            a = _a;
	            b = _b;
		    });
		});

		waits(1100);

		runs(function(){
            expect(a[0]).toBe(400);
            expect(b[0]).toBe(800);
            expect(a[1]).toBe(401);
            expect(b[1]).toBe(801);
            expect(700 < delay).toBe(true);
            expect(delay < 900).toBe(true);
	    });

	});

	it("chain", function(){

		var start = new Date();
		var delay, finaln;

		runs(function(){

			CC.promiseChain([
			    function() {
			        return passFowardLate(100);
			    },
			    function(n) {
			        return passFowardLate(n + 200);
			    },
			    function(n) {
			        return passFowardLate(n + 300);
			    },
			    function(n) {
			        return passFowardLate(n + 400);
			    }
			]).then(function(n) {
		    	delay = new Date() - start;
		    	finaln = n;
		    });

		});

		waits(2100);

		runs(function(){

			expect(finaln).toBe(1000);
			expect(1900 < delay).toBe(true);
			expect(delay < 2400).toBe(true);

		});

	});

	it("calls then even when chain is empty", function(){

		var itCalls = false;

		CC.promiseChain([]).then(function(n) {
			itCalls = true;
	    });

		runs(function(){

			expect(itCalls).toBe(true);

		});

	});

	it("chain with then", function(){

		var start = new Date();
		var delay, finaln;

		runs(function(){

			passFowardLate(100).then(function(n) {
		        return passFowardLate(n + 200);
		    }).then(function(n) {
		        return passFowardLate(n + 300);
		    }).then(function(n) {
		        return passFowardLate(n + 400);
		    }).then(function(n) {
		    	delay = new Date() - start;
		    	finaln = n;
		    });

		});

		waits(2100);

		runs(function(){

			expect(finaln).toBe(1000);
			expect(1900 < delay).toBe(true);
			expect(delay < 2400).toBe(true);

		});

	});

	it("calls then callback when trigger event", function(){

		var triggered = false;

		CC.when("eventname").then(function(){
			triggered = true;
		});

		CC.trigger("eventname");

		expect(triggered).toBe(true);

	});



});