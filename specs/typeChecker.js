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

		it("returns false if is zero", function(){

			var subj = 0;
			var resp = CC.isFunction(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is one", function(){

			var subj = 1;
			var resp = CC.isFunction(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is minus one", function(){

			var subj = -1;
			var resp = CC.isFunction(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a half", function(){

			var subj = 0.5;
			var resp = CC.isFunction(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is 8e5", function(){

			var subj = 8e5;
			var resp = CC.isFunction(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is 'new Number'", function(){

			var subj = new Number();
			var resp = CC.isFunction(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a number string", function(){

			var subj = "-12.34";
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

		it("returns false if is zero", function(){

			var subj = 0;
			var resp = CC.isString(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is one", function(){

			var subj = 1;
			var resp = CC.isString(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is minus one", function(){

			var subj = -1;
			var resp = CC.isString(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a half", function(){

			var subj = 0.5;
			var resp = CC.isString(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is 8e5", function(){

			var subj = 8e5;
			var resp = CC.isString(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is 'new Number'", function(){

			var subj = new Number();
			var resp = CC.isString(subj);
			
			expect(resp).toBe(false);

		});

		it("returns true if is a number string", function(){

			var subj = "-12.34";
			var resp = CC.isString(subj);
			
			expect(resp).toBe(true);

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

	describe("isNumber", function(){

		it("returns true if is zero", function(){

			var subj = 0;
			var resp = CC.isNumber(subj);
			
			expect(resp).toBe(true);

		});

		it("returns true if is one", function(){

			var subj = 1;
			var resp = CC.isNumber(subj);
			
			expect(resp).toBe(true);

		});

		it("returns true if is minus one", function(){

			var subj = -1;
			var resp = CC.isNumber(subj);
			
			expect(resp).toBe(true);

		});

		it("returns true if is a half", function(){

			var subj = 0.5;
			var resp = CC.isNumber(subj);
			
			expect(resp).toBe(true);

		});

		it("returns true if is 8e5", function(){

			var subj = 8e5;
			var resp = CC.isNumber(subj);
			
			expect(resp).toBe(true);

		});

		it("returns true if is 'new Number'", function(){

			var subj = new Number();
			var resp = CC.isNumber(subj);
			
			expect(resp).toBe(true);

		});

		it("returns true if is a number string", function(){

			var subj = "-12.34";
			var resp = CC.isNumber(subj);
			
			expect(resp).toBe(true);

		});

		it("returns false if is null", function(){

			var subj = null;
			var resp = CC.isNumber(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a string with no length", function(){

			var subj = "";
			var resp = CC.isNumber(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a string with length", function(){

			var subj = "notempty";
			var resp = CC.isNumber(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a 'new String'", function(){

			var subj = new String();
			var resp = CC.isNumber(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a function", function(){

			var subj = function(){};
			var resp = CC.isNumber(subj);

			expect(resp).toBe(false);

		});

		it("returns false if is a 'new Function'", function(){

			var subj = new Function();
			var resp = CC.isNumber(subj);

			expect(resp).toBe(false);

		});

		it("returns false if is an array with no length", function(){

			var subj = [];
			var resp = CC.isNumber(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is an array with length", function(){

			var subj = ["not", "empty"];
			var resp = CC.isNumber(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a 'new Array()'", function(){

			var subj = new Array();
			var resp = CC.isNumber(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a object with no length", function(){

			var subj = {};
			var resp = CC.isNumber(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a object with length", function(){

			var subj = {not: "empty"};
			var resp = CC.isNumber(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a 'new Object'", function(){

			var subj = new Object();
			var resp = CC.isNumber(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is an object by constructor and no length", function(){

			var constructor = function(){
			};

			var subj = new constructor();
			var resp = CC.isNumber(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is an object by constructor and length", function(){

			var constructor = function(){
				this.not = "empty";
			};

			var subj = new constructor();
			var resp = CC.isNumber(subj);
			
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

		it("returns false if is zero", function(){

			var subj = 0;
			var resp = CC.isArray(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is one", function(){

			var subj = 1;
			var resp = CC.isArray(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is minus one", function(){

			var subj = -1;
			var resp = CC.isArray(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a half", function(){

			var subj = 0.5;
			var resp = CC.isArray(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is 8e5", function(){

			var subj = 8e5;
			var resp = CC.isArray(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is 'new Number'", function(){

			var subj = new Number();
			var resp = CC.isArray(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a number string", function(){

			var subj = "-12.34";
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

		it("returns false if is zero", function(){

			var subj = 0;
			var resp = CC.isObject(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is one", function(){

			var subj = 1;
			var resp = CC.isObject(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is minus one", function(){

			var subj = -1;
			var resp = CC.isObject(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a half", function(){

			var subj = 0.5;
			var resp = CC.isObject(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is 8e5", function(){

			var subj = 8e5;
			var resp = CC.isObject(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is 'new Number'", function(){

			var subj = new Number();
			var resp = CC.isObject(subj);
			
			expect(resp).toBe(false);

		});

		it("returns false if is a number string", function(){

			var subj = "-12.34";
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