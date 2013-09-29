describe("typeChecker.js", function(){
	
	describe("isFunction", function(){

		it("returns true if is a function", function(){

			var subj = function(){};
			var resp = CC.isFunction(subj);

			expect(resp).toBe(true);

		});

		it("returns true if is a 'new Function'", function(){

			var subj = new Function();
			var resp = CC.isFunction(subj);

			expect(resp).toBe(true);

		});

		it("returns false if is null", function(){

			var subj = null;
			var resp = CC.isFunction(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a string with no length", function(){

			var subj = "";
			var resp = CC.isFunction(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a string with length", function(){

			var subj = "notempty";
			var resp = CC.isFunction(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a 'new String'", function(){

			var subj = new String();
			var resp = CC.isFunction(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is an array with no length", function(){

			var subj = [];
			var resp = CC.isFunction(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is an array with length", function(){

			var subj = ["not", "empty"];
			var resp = CC.isFunction(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a 'new Array()'", function(){

			var subj = new Array();
			var resp = CC.isFunction(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a object with no length", function(){

			var subj = {};
			var resp = CC.isFunction(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a object with length", function(){

			var subj = {not: "empty"};
			var resp = CC.isFunction(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a 'new Object'", function(){

			var subj = new Object();
			var resp = CC.isFunction(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is an object by constructor and no length", function(){

			var constructor = function(){
			};

			var subj = new constructor();
			var resp = CC.isFunction(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is an object by constructor and length", function(){

			var constructor = function(){
				this.not = "empty";
			};

			var subj = new constructor();
			var resp = CC.isFunction(subj);
			
			expect(resp).toBe(false);

		});

	});
	
	describe("isString", function(){

		it("returns true if is a string with no length", function(){

			var subj = "";
			var resp = CC.isString(subj);
			
			expect(resp).toBe(true);

		});

		it("returns true if is a string with length", function(){

			var subj = "notempty";
			var resp = CC.isString(subj);
			
			expect(resp).toBe(true);

		});

		it("returns true if is a 'new String'", function(){

			var subj = new String();
			var resp = CC.isString(subj);
			
			expect(resp).toBe(true);

		});

		it("returns false if is null", function(){

			var subj = null;
			var resp = CC.isString(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a function", function(){

			var subj = function(){};
			var resp = CC.isString(subj);

			expect(resp).toBe(false);

		});

		it("returns false if is a 'new Function'", function(){

			var subj = new Function();
			var resp = CC.isString(subj);

			expect(resp).toBe(false);

		});

		it("returns false if is an array with no length", function(){

			var subj = [];
			var resp = CC.isString(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is an array with length", function(){

			var subj = ["not", "empty"];
			var resp = CC.isString(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a 'new Array()'", function(){

			var subj = new Array();
			var resp = CC.isString(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a object with no length", function(){

			var subj = {};
			var resp = CC.isString(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a object with length", function(){

			var subj = {not: "empty"};
			var resp = CC.isString(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a 'new Object'", function(){

			var subj = new Object();
			var resp = CC.isString(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is an object by constructor and no length", function(){

			var constructor = function(){
			};

			var subj = new constructor();
			var resp = CC.isString(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is an object by constructor and length", function(){

			var constructor = function(){
				this.not = "empty";
			};

			var subj = new constructor();
			var resp = CC.isString(subj);
			
			expect(resp).toBe(false);

		});

	});

	describe("isArray", function(){

		it("returns true if is an array with no length", function(){

			var subj = [];
			var resp = CC.isArray(subj);
			
			expect(resp).toBe(true);

		});

		it("returns true if is an array with length", function(){

			var subj = ["not", "empty"];
			var resp = CC.isArray(subj);
			
			expect(resp).toBe(true);

		});

		it("returns true if is a 'new Array()'", function(){

			var subj = new Array();
			var resp = CC.isArray(subj);
			
			expect(resp).toBe(true);

		});

		it("returns false if is null", function(){

			var subj = null;
			var resp = CC.isArray(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a function", function(){

			var subj = function(){};
			var resp = CC.isArray(subj);

			expect(resp).toBe(false);

		});

		it("returns false if is a 'new Function'", function(){

			var subj = new Function();
			var resp = CC.isArray(subj);

			expect(resp).toBe(false);

		});

		it("returns false if is a string with no length", function(){

			var subj = "";
			var resp = CC.isArray(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a string with length", function(){

			var subj = "notempty";
			var resp = CC.isArray(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a 'new String'", function(){

			var subj = new String();
			var resp = CC.isArray(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a object with no length", function(){

			var subj = {};
			var resp = CC.isArray(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a object with length", function(){

			var subj = {not: "empty"};
			var resp = CC.isArray(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a 'new Object'", function(){

			var subj = new Object();
			var resp = CC.isArray(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is an object by constructor and no length", function(){

			var constructor = function(){
			};

			var subj = new constructor();
			var resp = CC.isArray(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is an object by constructor and length", function(){

			var constructor = function(){
				this.not = "empty";
			};

			var subj = new constructor();
			var resp = CC.isArray(subj);
			
			expect(resp).toBe(false);

		});

	});

	describe("isObject", function(){

		it("returns true if is a object with no length", function(){

			var subj = {};
			var resp = CC.isObject(subj);
			
			expect(resp).toBe(true);

		});

		it("returns true if is a object with length", function(){

			var subj = {not: "empty"};
			var resp = CC.isObject(subj);
			
			expect(resp).toBe(true);

		});

		it("returns true if is a 'new Object'", function(){

			var subj = new Object();
			var resp = CC.isObject(subj);
			
			expect(resp).toBe(true);

		});

		it("returns true if is an object by constructor and no length", function(){

			var constructor = function(){
			};

			var subj = new constructor();
			var resp = CC.isObject(subj);
			
			expect(resp).toBe(true);

		});

		it("returns true if is an object by constructor and length", function(){

			var constructor = function(){
				this.not = "empty";
			};

			var subj = new constructor();
			var resp = CC.isObject(subj);
			
			expect(resp).toBe(true);

		});

		it("returns false if is null", function(){

			var subj = null;
			var resp = CC.isObject(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a function", function(){

			var subj = function(){};
			var resp = CC.isObject(subj);

			expect(resp).toBe(false);

		});

		it("returns false if is a 'new Function'", function(){

			var subj = new Function();
			var resp = CC.isObject(subj);

			expect(resp).toBe(false);

		});

		it("returns false if is a string with no length", function(){

			var subj = "";
			var resp = CC.isObject(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a string with length", function(){

			var subj = "notempty";
			var resp = CC.isObject(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a 'new String'", function(){

			var subj = new String();
			var resp = CC.isObject(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is an array with no length", function(){

			var subj = [];
			var resp = CC.isObject(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is an array with length", function(){

			var subj = ["not", "empty"];
			var resp = CC.isObject(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a 'new Array()'", function(){

			var subj = new Array();
			var resp = CC.isObject(subj);
			
			expect(resp).toBe(false);

		});

	});

});