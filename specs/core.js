describe("core.js", function() {

	describe("Selecting", function() {

		CC.clear();
		
		CC.new("Class1");
		CC.new("Class1 Class2");
		CC.new("#Id1");
		CC.new("#Id2 Class2");
		CC.new("#Id3 Class3");

	    it("Select by class", function() {
	        expect(CC("Class1").length).toBe(2);
	        expect(CC("Class2").length).toBe(2);
	        expect(CC("Class3").length).toBe(1);
	        expect(CC("Class4").length).toBe(0);
	    });

	    it("Select by id", function() {
	        expect(CC("#Id1").length).toBe(1);
	        expect(CC("#Id2").length).toBe(1);
	        expect(CC("#Id3").length).toBe(1);
	        expect(CC("#Id4").length).toBe(0);
	    });

	    it("Select by many classes", function() {
	        expect(CC("Class1 Class2").length).toBe(1);
	        expect(CC("Class2 Class1").length).toBe(1);
	        expect(CC("Class1 Class3").length).toBe(0);
	    });

	    it("Select by id and class", function() {
	        expect(CC("#Id2 Class2").length).toBe(1);
	        expect(CC("#Id3 Class3").length).toBe(1);
	        expect(CC("#Id2 Class1").length).toBe(0);
	        expect(CC("#Id1 Class2").length).toBe(0);
	    });
	});

	describe("new", function(){

		beforeEach(function(){

			CC.clear();

			CC.def("Class1", function(){
				this.testValue = 1;
				this.testValue1 = 1;
			});

			CC.def("Class2", function(){
				this.testValue = 2;
				this.testValue2 = 2;
			});

			CC.def("Class3", function(){
				this.testValue = 3;
				this.testValue3 = 3;
			});

		});

		it("instantiate single class", function(){
			expect(CC.new("Class1").testValue).toBe(1);
			expect(CC.new("Class2").testValue).toBe(2);
			expect(CC.new("Class3").testValue).toBe(3);
		});

		it("instantiate many classes at once", function(){
			var class1And2 = CC.new("Class1 Class2");
			expect(class1And2.testValue).toBe(2);
			expect(class1And2.testValue1).toBe(1);
			expect(class1And2.testValue2).toBe(2);
			expect(class1And2.testValue3).not.toBeDefined();

			var class2And1 = CC.new("Class2 Class1");
			expect(class2And1.testValue).toBe(1);
			expect(class2And1.testValue1).toBe(1);
			expect(class2And1.testValue2).toBe(2);
			expect(class2And1.testValue3).not.toBeDefined();

			var class1And3 = CC.new("Class1 Class3");
			expect(class1And3.testValue).toBe(3);
			expect(class1And3.testValue1).toBe(1);
			expect(class1And3.testValue2).not.toBeDefined();
			expect(class1And3.testValue3).toBe(3);

			var class3And1 = CC.new("Class3 Class1");
			expect(class3And1.testValue).toBe(1);
			expect(class3And1.testValue1).toBe(1);
			expect(class3And1.testValue2).not.toBeDefined();
			expect(class3And1.testValue3).toBe(3);

			var class2And3 = CC.new("Class2 Class3");
			expect(class2And3.testValue).toBe(3);
			expect(class2And3.testValue1).not.toBeDefined();
			expect(class2And3.testValue2).toBe(2);
			expect(class2And3.testValue3).toBe(3);

			var class3And2 = CC.new("Class3 Class2");
			expect(class3And2.testValue).toBe(2);
			expect(class3And2.testValue1).not.toBeDefined();
			expect(class3And2.testValue2).toBe(2);
			expect(class3And2.testValue3).toBe(3);
		});

	});


	describe("def", function(){

		describe("defining a single class", function(){

			beforeEach(function(){
				CC.clear();

				CC.def("SubjectClass", function(opts){

					//when we use "this." it is public
					//when we use "var " it is private

					this.publicAtr = "this is public";
					var privateAtr = "this is private ";

					if (opts) {
						this.publicAtrByConstructor = opts.param1;
						var privateAtrByConstructor = opts.param2;
					}

					var el = this; // to access public fields inside private methods

					var privateMethod = function(){
						return privateAtr;
					};

					this.publicMethod = function(){
						return privateMethod() + this.publicAtr;
					};

					var privateMethodAcessingConstructorParams = function(){
						return el.publicAtrByConstructor;
					};

					this.publicMethodAcessingConstructorParams = function(){
						return privateMethodAcessingConstructorParams() + privateAtrByConstructor;
					}

				});

			});

			it("works with constructor params", function(){

				var elId2 = CC.new("#Id2 SubjectClass", {
					param1: "foo",
					param2: "bar"
				});

				expect(elId2.publicAtrByConstructor).toBe("foo");
				expect(elId2.publicMethodAcessingConstructorParams()).toBe("foobar");

			});

			describe("constructor without params", function(){

				var elId1;

				beforeEach(function(){

					elId1 = CC.new("#Id1 SubjectClass");

				});

				it("is able to access public attrs", function(){

					expect(elId1.publicAtr).toBe("this is public");

				});

				it("is not able to access private attrs", function(){

					expect(elId1.privateAtr).not.toBeDefined();

				});

				it("is able to access public methods", function(){

					expect(elId1.publicMethod()).toBe("this is private this is public");

				});

				it("is not able to access private methods", function(){

					expect(elId1.privateMethod).not.toBeDefined();

				});

				it("increment class constructor for new instances", function(){

					expect(elId1.newAtr).not.toBeDefined();

					CC.def("SubjectClass", function(){
						this.newAtr = "new attr";
					});

					var elId2 = CC.new("#Id2 SubjectClass");

					expect(elId2.newAtr).toBe("new attr");

				});

			});

		});

	});

	describe("clear", function(){

		var timesEventWasTriggeredWhenBinded;

		beforeEach(function(){

			CC.clear();
			timesEventWasTriggeredWhenBinded = 0;
			
			CC.def("ClassA", function(){});
			CC.def("ClassB", function(){});
			CC.new("ClassA");
			CC.new("ClassA ClassB");
			CC.bind("Event1", function(){
				timesEventWasTriggeredWhenBinded++;
			});

		});

		var countObjAttrs = function(obj){
					
		    var size = 0, key;
		    for (key in obj) {
		        if (obj.hasOwnProperty(key)) size++;
		    }
		    return size;
		};

		it("removes the classes", function(){

			expect(countObjAttrs(CC.classes)).toBe(2);

			CC.clear();

			expect(countObjAttrs(CC.classes)).toBe(0);

		});

		it("removes the elements", function(){

			expect(CC("*").length).toBe(2);

			CC.clear();

			expect(CC("*").length).toBe(0);

		});

		it("unbind the events", function(){

			expect(timesEventWasTriggeredWhenBinded).toBe(0);

			CC.trigger("Event1");

			expect(timesEventWasTriggeredWhenBinded).toBe(1);

			CC.clear();
			CC.trigger("Event1");

			expect(timesEventWasTriggeredWhenBinded).toBe(1);

		});

	});

	describe("remove", function(){

		var timesEventWasTriggeredWhenBinded;

		beforeEach(function(){

			timesEventWasTriggeredWhenBinded = 0;

		});

		it("remove the element", function(){

			var el = CC.new("#El");
			el.bind("remove", function(){
				timesEventWasTriggeredWhenBinded++;
			});

			expect(CC("#El").length).toBe(1);
			expect(timesEventWasTriggeredWhenBinded).toBe(0);
			CC.remove(el);
			expect(CC("#El").length).toBe(0);
			expect(timesEventWasTriggeredWhenBinded).toBe(1);
			CC.remove(el);
			expect(timesEventWasTriggeredWhenBinded).toBe(1);

		});

	});

});