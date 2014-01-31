describe("elementlist", function () {

	it("implements global methods", function(){

		var globalMethod1InvokedTimes = 0;

		CC.fn.globalMethod1 = function(){
			globalMethod1InvokedTimes++;
		};

		CC.fn.wrongType = "I have no idea what i am doing";

		CC.new("#El1");
		CC.new("#El2");
		var list = CC("*");
		list.globalMethod1();
		expect(globalMethod1InvokedTimes).toBe(1);
		expect(list.wrongType).not.toBeDefined();


	});

	it("gets the element with the 'e' method", function(){
		CC.clear();

		var first = CC.new("#El1");
		var second = CC.new("#El2");
		var list = CC("*");
		var expectedFirst = list.e(0);
		var expectedSecond = list.e(1);

		expect(expectedFirst).toBe(first);
		expect(expectedSecond).toBe(second);
	});

	it("gets a copy of the elements with the 'asArray' method", function(){
		CC.clear();

		CC.new("#El1");
		CC.new("#El2");
		var list = CC("*");

		var copy = list.asArray();
		copy.push(null);
		var copy2 = list.asArray();

		expect(copy.length).toBe(3);
		expect(copy2.length).toBe(2);
	});

	it("sorts elements by a property with the 'sort' method", function(){
		CC.clear();

		CC.new("#El1").indexA = 3;
		CC.new("#El2").indexA = 7;
		CC.new("#El3").indexA = 2;
		CC.new("#El4").indexA = 6;
		var list = CC("*");
		list.sort("indexA");

		expect(list.e(0).id).toBe("#El3");
		expect(list.e(1).id).toBe("#El1");
		expect(list.e(2).id).toBe("#El4");
		expect(list.e(3).id).toBe("#El2");

	});

	it("finds in the list the elements with the specified params with the 'search' method", function(){
		CC.clear();

		CC.new("#El1").indexA = 3;
		CC.new("#El2").indexA = 2;
		CC.new("#El3").indexA = 2;
		CC.new("#El4").indexA = 6;
		var list = CC("*");

		var result = list.search({
			indexA: 2
		});

		expect(result.e(0).id).toBe("#El2");
		expect(result.e(1).id).toBe("#El3");

	});

	describe("add", function(){

		it("adds a list into another", function(){

			CC.clear();

			CC.new("#El1 ClassA");
			CC.new("#El2 ClassB");
			CC.new("#El3 ClassC");
			CC.new("#El4 ClassB");
			CC.new("#El5 ClassA");
			var listA = CC("ClassA");
			var listB = CC("ClassB");

			var listAB = listA.add(listB);

			
			expect(listAB.e(0).id).toBe("#El1");
			expect(listAB.e(1).id).toBe("#El5");
			expect(listAB.e(2).id).toBe("#El2");
			expect(listAB.e(3).id).toBe("#El4");

			expect(listA.e(0).id).toBe("#El1");
			expect(listA.e(1).id).toBe("#El5");
			expect(listA.e(2)).not.toBeDefined();
			expect(listA.e(3)).not.toBeDefined();

			expect(listB.e(0).id).toBe("#El2");
			expect(listB.e(1).id).toBe("#El4");
			expect(listB.e(2)).not.toBeDefined();
			expect(listB.e(3)).not.toBeDefined();
			

		});

		it("adds a selection result into s list", function(){

			CC.clear();

			CC.new("#El1 ClassA");
			CC.new("#El2 ClassB");
			CC.new("#El3 ClassC");
			CC.new("#El4 ClassB");
			CC.new("#El5 ClassA");
			var listA = CC("ClassA");
			var listB = CC("ClassB");

			var listAB = listA.add("ClassB");

			
			expect(listAB.e(0).id).toBe("#El1");
			expect(listAB.e(1).id).toBe("#El5");
			expect(listAB.e(2).id).toBe("#El2");
			expect(listAB.e(3).id).toBe("#El4");

			expect(listA.e(0).id).toBe("#El1");
			expect(listA.e(1).id).toBe("#El5");
			expect(listA.e(2)).not.toBeDefined();
			expect(listA.e(3)).not.toBeDefined();

			expect(listB.e(0).id).toBe("#El2");
			expect(listB.e(1).id).toBe("#El4");
			expect(listB.e(2)).not.toBeDefined();
			expect(listB.e(3)).not.toBeDefined();
			

		});

		it("doesnt add if the param is null", function(){

			CC.clear();

			CC.new("#El1 ClassA");
			CC.new("#El2 ClassB");
			CC.new("#El3 ClassC");
			CC.new("#El4 ClassB");
			CC.new("#El5 ClassA");
			var listA = CC("ClassA");

			var listAB = listA.add(null);

			expect(listAB.e(0).id).toBe("#El1");
			expect(listAB.e(1).id).toBe("#El5");
			expect(listAB.e(2)).not.toBeDefined();
			expect(listAB.e(3)).not.toBeDefined();

			expect(listA.e(0).id).toBe("#El1");
			expect(listA.e(1).id).toBe("#El5");
			expect(listA.e(2)).not.toBeDefined();
			expect(listA.e(3)).not.toBeDefined();
			

		});

		it("doesnt add if the param is not a string or array", function(){

			CC.clear();

			CC.new("#El1 ClassA");
			CC.new("#El2 ClassB");
			CC.new("#El3 ClassC");
			CC.new("#El4 ClassB");
			CC.new("#El5 ClassA");
			var listA = CC("ClassA");

			var listAB = listA.add(123);

			expect(listAB.e(0).id).toBe("#El1");
			expect(listAB.e(1).id).toBe("#El5");
			expect(listAB.e(2)).not.toBeDefined();
			expect(listAB.e(3)).not.toBeDefined();

			expect(listA.e(0).id).toBe("#El1");
			expect(listA.e(1).id).toBe("#El5");
			expect(listA.e(2)).not.toBeDefined();
			expect(listA.e(3)).not.toBeDefined();
			

		});

	});

	describe("sub", function(){

		it("subtracts a list from another", function(){

			CC.clear();

			CC.new("#El1 ClassA ClassB");
			CC.new("#El2 ClassB ClassC");
			CC.new("#El3 ClassC ClassA");
			CC.new("#El4 ClassB ClassC");
			CC.new("#El5 ClassA");
			var listA = CC("ClassA");
			var listB = CC("ClassB");

			var listAminB = listA.sub(listB);

			
			expect(listAminB.e(0).id).toBe("#El3");
			expect(listAminB.e(1).id).toBe("#El5");
			expect(listAminB.e(2)).not.toBeDefined()

			expect(listA.e(0).id).toBe("#El1");
			expect(listA.e(1).id).toBe("#El3");
			expect(listA.e(2).id).toBe("#El5");

			expect(listB.e(0).id).toBe("#El1");
			expect(listB.e(1).id).toBe("#El2");
			expect(listB.e(2).id).toBe("#El4");
			

		});

		it("doesnt subtract a selection result from a list", function(){

			CC.clear();

			CC.new("#El1 ClassA ClassB");
			CC.new("#El2 ClassB ClassC");
			CC.new("#El3 ClassC ClassA");
			CC.new("#El4 ClassB ClassC");
			CC.new("#El5 ClassA");
			var listA = CC("ClassA");
			var listB = CC("ClassB");

			var listAminB = listA.sub("ClassB");

			
			expect(listAminB.e(0).id).toBe("#El3");
			expect(listAminB.e(1).id).toBe("#El5");
			expect(listAminB.e(2)).not.toBeDefined()

			expect(listA.e(0).id).toBe("#El1");
			expect(listA.e(1).id).toBe("#El3");
			expect(listA.e(2).id).toBe("#El5");

			expect(listB.e(0).id).toBe("#El1");
			expect(listB.e(1).id).toBe("#El2");
			expect(listB.e(2).id).toBe("#El4");
			

		});

		it("doesnt subtract if the param is null", function(){

			CC.clear();

			CC.new("#El1 ClassA ClassB");
			CC.new("#El2 ClassB ClassC");
			CC.new("#El3 ClassC ClassA");
			CC.new("#El4 ClassB ClassC");
			CC.new("#El5 ClassA");
			var listA = CC("ClassA");

			var listAminB = listA.sub(null);

			
			expect(listAminB.e(0).id).toBe("#El1");
			expect(listAminB.e(1).id).toBe("#El3");
			expect(listAminB.e(2).id).toBe("#El5");

			expect(listA.e(0).id).toBe("#El1");
			expect(listA.e(1).id).toBe("#El3");
			expect(listA.e(2).id).toBe("#El5");
			

		});

		it("doesnt subtract if the param is not a string or array", function(){

			CC.clear();

			CC.new("#El1 ClassA ClassB");
			CC.new("#El2 ClassB ClassC");
			CC.new("#El3 ClassC ClassA");
			CC.new("#El4 ClassB ClassC");
			CC.new("#El5 ClassA");
			var listA = CC("ClassA");

			var listAminB = listA.sub(123);

			
			expect(listAminB.e(0).id).toBe("#El1");
			expect(listAminB.e(1).id).toBe("#El3");
			expect(listAminB.e(2).id).toBe("#El5");

			expect(listA.e(0).id).toBe("#El1");
			expect(listA.e(1).id).toBe("#El3");
			expect(listA.e(2).id).toBe("#El5");
			

		});

	});

	it("inherit", function(){

		CC.clear();

		CC.def("Class1", function(){
			this.testValue = 1;
		});

		CC.new("#El1 Class2");
		CC.new("#El2");
		CC.new("#El3 Class2");

		CC("Class2").inherit("Class1");

		expect(CC("#El1").e(0).testValue).toBe(1);
		expect(CC("#El2").e(0).testValue).not.toBeDefined();
		expect(CC("#El3").e(0).testValue).toBe(1);

	});

	it("merge", function(){

		CC.clear();

		CC.new("#El1 Class2");
		CC.new("#El2");
		CC.new("#El3 Class2");

		CC("Class2").merge({
			testValue: 1
		});

		expect(CC("#El1").e(0).testValue).toBe(1);
		expect(CC("#El2").e(0).testValue).not.toBeDefined();
		expect(CC("#El3").e(0).testValue).toBe(1);

	});

	it("remove", function(){

		CC.clear();

		CC.new("#El1 Class2");
		CC.new("#El2");
		CC.new("#El3 Class2");

		CC("Class2").remove();

		expect(CC("#El1").length).toBe(0);
		expect(CC("#El2").length).toBe(1);
		expect(CC("#El3").length).toBe(0);

	});

	it("removeClass", function(){

		CC.clear();

		CC.new("#El1 Class2 Class3");
		CC.new("#El2 Class3");
		CC.new("#El3 Class2 Class3");
		CC.new("#El4 Class2");

		CC("Class2").removeClass("Class3");

		expect(CC("#El1").e(0).classes["Class3"]).not.toBeDefined();
		expect(CC("#El2").e(0).classes["Class3"]).toBeDefined();
		expect(CC("#El3").e(0).classes["Class3"]).not.toBeDefined();
		expect(CC("#El4").e(0).classes["Class3"]).not.toBeDefined();

	});

	it("became", function(){

		CC.clear();

		CC.startLoop();

		var triggeredTimes = 0;

		var el1 = CC.new("#El1 Class2");
		var el2 = CC.new("#El2");
		var el3 = CC.new("#El3 Class2");

		var ccevt = CC("Class2").became({
			test: 1
		}, function(){
			triggeredTimes++;
		});

		waits(100);

		runs(function(){
			expect(triggeredTimes).toBe(0);
			el1.test = 2;
		});

		waits(100);

		runs(function(){
			expect(triggeredTimes).toBe(0);
			el1.test = 1;
		});

		waits(100);

		runs(function(){
			expect(triggeredTimes).toBe(1);
			el3.test = 1;
		});

		waits(100);

		runs(function(){
			expect(triggeredTimes).toBe(2);
			el2.test = 1;
		});

		waits(100);

		runs(function(){
			expect(triggeredTimes).toBe(2);
			ccevt.unbind();
			CC.stopLoop();
		});

	});

	it("while", function(){

		CC.clear();

		CC.startLoop();

		var el1 = CC.new("#El1 Class2");
		var el2 = CC.new("#El2");
		var el3 = CC.new("#El3 Class2");

		el1.triggeredTimes = 0;
		el2.triggeredTimes = 0;
		el3.triggeredTimes = 0;

		var ccevt = CC("Class2").while({
			test: 1
		}, function(){
			this.triggeredTimes++;
		});

		waits(100);

		runs(function(){
			expect(el1.triggeredTimes).toBe(0);
			expect(el2.triggeredTimes).toBe(0);
			expect(el3.triggeredTimes).toBe(0);
			el1.test = 1;
		});

		waits(100);

		runs(function(){
			el1.triggeredTimesStopAt = el1.triggeredTimes;
			el2.triggeredTimesStopAt = el2.triggeredTimes;
			el3.triggeredTimesStopAt = el3.triggeredTimes;

			expect(el1.triggeredTimes > 1).toBe(true);
			expect(el2.triggeredTimes).toBe(0);
			expect(el3.triggeredTimes).toBe(0);
			el1.test = 2;
		});

		waits(100);

		runs(function(){

			expect(el1.triggeredTimes).toBe(el1.triggeredTimesStopAt);
			expect(el2.triggeredTimes).toBe(el2.triggeredTimesStopAt);
			expect(el3.triggeredTimes).toBe(el3.triggeredTimesStopAt);
			
			CC.stopLoop();
			ccevt.unbind();
		});

	});

	it("onClick", function(){
		CC.clear();

		var triggeredTimes = 0;

		var el1 = CC.new("#El1 Class1", {
			x: 60,
			y: 90,
			w: 30,
			h: 30
		});

		var el2 = CC.new("#El2 Class1", {
			x: 60,
			y: 90,
			w: 30,
			h: 30
		});

		var ccevt = CC("Class1").onClick(function(){
			triggeredTimes++;
		});

		expect(triggeredTimes).toBe(0);

		CC.trigger("click", {
			offsetX: 70,
			offsetY: 100
		});

		expect(triggeredTimes).toBe(2);

		CC.trigger("click", {
			offsetX: 50,
			offsetY: 100
		});

		expect(triggeredTimes).toBe(2);

		ccevt.unbind();
	});

	it("hideAllLayers", function(){

		CC.clear();

		CC.def("Class1", function(){
			this.layers = {
				l1:{},
				l2:{}
			};
		});

		var el1 = CC.new("#El1 Class1");
		var el2 = CC.new("#El2 Class1");

		CC("Class1").hideAllLayers();

		expect(el1.layers.l1.hidden).toBe(true);
		expect(el1.layers.l2.hidden).toBe(true);
		expect(el2.layers.l1.hidden).toBe(true);
		expect(el2.layers.l2.hidden).toBe(true);

	});

	it("toggleLayers", function(){

		CC.clear();

		CC.def("Class1", function(){
			this.layers = {
				l1:{},
				l2:{hidden: true}
			};
		});

		var el1 = CC.new("#El1 Class1");
		var el2 = CC.new("#El2 Class1");

		CC("Class1").toggleLayers("l1", "l2");

		expect(el1.layers.l1.hidden).toBe(true);
		expect(el1.layers.l2.hidden).toBe(false);
		expect(el2.layers.l1.hidden).toBe(true);
		expect(el2.layers.l2.hidden).toBe(false);

	});
	
});