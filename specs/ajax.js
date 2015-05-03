describe("ajax.js", function(){

	var realXMLHttpRequest = window.XMLHttpRequest;

	it("abort on timeout", function(){

	    var isAborted = false;
	    CC.ajaxTimeout = 2000;

	    //mocking the request
	    window.XMLHttpRequest = function () {
	        this.readyState = 4;
	        this.status = 200;
	        this.responseText = 'a response text';
	        this.open = function () {};
	        this.setRequestHeader = function () {};
	        this.onreadystatechange = function () {};
	        var self = this;
	        this.send = function () {
	            setTimeout(function() {
	                self.onreadystatechange();
	            }, 3000);
	        };


	        this.abort = function () { 
	        	isAborted = true; 
	        };
	    };

		var success, response;

		runs(function(){
			CC.ajax("GET", "/").then(function(_success, _response) {
				success = _success;
				response = _response;
			});
		});

		waits(2100);

		runs(function(){
			expect(isAborted).toBe(true);
			expect(success).toBe(false);
			expect(response).toBe("timeout");
		});

	});

	it("get error if status is 404", function(){

	    var isAborted = false;
	    CC.ajaxTimeout = 2000;

	    //mocking the request
	    window.XMLHttpRequest = function () {
	        this.readyState = 4;
	        this.status = 404;
	        this.responseText = 'a response text';
	        this.open = function () {};
	        this.setRequestHeader = function () {};
	        this.onreadystatechange = function () {};
	        var self = this;
	        this.send = function () {
	            setTimeout(function() {
	                self.onreadystatechange();
	            }, 200);
	        };


	        this.abort = function () { 
	        	isAborted = true; 
	        };
	    };

		var success, response, xhr;

		runs(function(){
			CC.ajax("GET", "/").then(function(_success, _response, _xhr) {
				success = _success;
				response = _response;
				xhr = _xhr;
			});
		});

		waits(300);

		runs(function(){
			expect(isAborted).toBe(false);
			expect(success).toBe(false);
			expect(response).toBe("a response text");
			expect(xhr).not.toBe(null);
		});

	});

	it("get success if request is successful", function(){

	    var isAborted = false;
	    CC.ajaxTimeout = 2000;

	    //mocking the request
	    window.XMLHttpRequest = function () {
	        this.readyState = 4;
	        this.status = 200;
	        this.responseText = 'a response text';
	        this.open = function () {};
	        this.setRequestHeader = function () {};
	        this.onreadystatechange = function () {};
	        var self = this;
	        this.send = function () {
	            setTimeout(function() {
	                self.onreadystatechange();
	            }, 200);
	        };


	        this.abort = function () { 
	        	isAborted = true; 
	        };
	    };

		var success, response, xhr;

		runs(function(){
			CC.ajax("GET", "/").then(function(_success, _response, _xhr) {
				success = _success;
				response = _response;
				xhr = _xhr;
			});
		});

		waits(300);

		runs(function(){
			expect(isAborted).toBe(false);
			expect(success).toBe(true);
			expect(response).toBe("a response text");
			expect(xhr).not.toBe(null);
		});

	});

	// it("makes a real request", function(){

	// 	window.XMLHttpRequest = realXMLHttpRequest;
	// 	CC.ajaxTimeout = 0;

	// 	var success, response, xhr;

	// 	runs(function(){
	// 		CC.ajax("GET",
	//         	"http://www.reddit.com/r/javascript.json", 
	//         	{
	//         		t: "all"
	//         	})
	// 		.then(function(_success, _response, _xhr){
			    
	// 			success = _success;
	// 			response = _response;
	// 			xhr = _xhr;
			    
	// 		});
	// 	});

	// 	waits(2000);

	// 	runs(function() {
	// 		expect(success).toBe(true);
	// 		expect(response).not.toBe(null);
	// 		expect(xhr).not.toBe(null);
	// 	});

	// });

	// it("makes request with ActiveXObject and json string", function(){

	// 	window.XMLHttpRequest = null;
	// 	window.ActiveXObject = realXMLHttpRequest;

	// 	var success, response, xhr;

	// 	runs(function(){
	// 		CC.ajax("GET",
	//         	"http://www.reddit.com/r/javascript.json", 
	//         	"{ t: 'all' }")
	// 		.then(function(_success, _response, _xhr){
			    
	// 			success = _success;
	// 			response = _response;
	// 			xhr = _xhr;
			    
	// 		});
	// 	});

	// 	waits(2000);

	// 	runs(function() {
	// 		expect(success).toBe(true);
	// 		expect(response).not.toBe(null);
	// 		expect(xhr).not.toBe(null);
	// 	});

	// });

	window.XMLHttpRequest = realXMLHttpRequest;

});