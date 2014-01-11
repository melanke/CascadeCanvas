describe("element.js", function(){

	//inherit was tested in "core.js"

	describe("matches", function(){

		it("matching integer", function(){

			var element = CC.new("#Element");
			element.attr1 = 3;
			element.attr2 = "hi!";
			element.attr3 = true;

			var result = element.matches({
				attr1: 3
			});

			expect(result).toBe(true);

		});

		it("unmatching integer", function(){

			var element = CC.new("#Element");
			element.attr1 = 3;
			element.attr2 = "hi!";
			element.attr3 = true;

			var result = element.matches({
				attr1: 4
			});

			expect(result).toBe(false);

		});

		it("matching string", function(){

			var element = CC.new("#Element");
			element.attr1 = 3;
			element.attr2 = "hi!";
			element.attr3 = true;

			var result = element.matches({
				attr2: "hi!"
			});

			expect(result).toBe(true);

		});

		it("unmatching string", function(){

			var element = CC.new("#Element");
			element.attr1 = 3;
			element.attr2 = "hi!";
			element.attr3 = true;

			var result = element.matches({
				attr2: "hey!"
			});

			expect(result).toBe(false);

		});

		it("matching boolean", function(){

			var element = CC.new("#Element");
			element.attr1 = 3;
			element.attr2 = "hi!";
			element.attr3 = true;

			var result = element.matches({
				attr3: true
			});

			expect(result).toBe(true);

		});

		it("unmatching boolean", function(){

			var element = CC.new("#Element");
			element.attr1 = 3;
			element.attr2 = "hi!";
			element.attr3 = true;

			var result = element.matches({
				attr3: false
			});

			expect(result).toBe(false);

		});

		it("matching integer gt comparison", function(){

			var element = CC.new("#Element");
			element.attr1 = 3;
			element.attr2 = "hi!";
			element.attr3 = true;

			var result = element.matches({
				attr1: ">2"
			});

			expect(result).toBe(true);

		});

		it("unmatching integer gt comparison", function(){

			var element = CC.new("#Element");
			element.attr1 = 3;
			element.attr2 = "hi!";
			element.attr3 = true;

			var result = element.matches({
				attr1: ">3"
			});

			expect(result).toBe(false);

		});

		it("matching integer lt comparison", function(){

			var element = CC.new("#Element");
			element.attr1 = 3;
			element.attr2 = "hi!";
			element.attr3 = true;

			var result = element.matches({
				attr1: "<4"
			});

			expect(result).toBe(true);

		});

		it("unmatching integer lt comparison", function(){

			var element = CC.new("#Element");
			element.attr1 = 3;
			element.attr2 = "hi!";
			element.attr3 = true;

			var result = element.matches({
				attr1: "<3"
			});

			expect(result).toBe(false);

		});

		it("matching integer ge comparison", function(){

			var element = CC.new("#Element");
			element.attr1 = 3;
			element.attr2 = "hi!";
			element.attr3 = true;

			var result = element.matches({
				attr1: ">=3"
			});

			expect(result).toBe(true);

		});

		it("unmatching integer ge comparison", function(){

			var element = CC.new("#Element");
			element.attr1 = 3;
			element.attr2 = "hi!";
			element.attr3 = true;

			var result = element.matches({
				attr1: ">=4"
			});

			expect(result).toBe(false);

		});

		it("matching integer le comparison", function(){

			var element = CC.new("#Element");
			element.attr1 = 3;
			element.attr2 = "hi!";
			element.attr3 = true;

			var result = element.matches({
				attr1: "<=3"
			});

			expect(result).toBe(true);

		});

		it("unmatching integer le comparison", function(){

			var element = CC.new("#Element");
			element.attr1 = 3;
			element.attr2 = "hi!";
			element.attr3 = true;

			var result = element.matches({
				attr1: "<=2"
			});

			expect(result).toBe(false);

		});

		it("matching integer diff comparison", function(){

			var element = CC.new("#Element");
			element.attr1 = 3;
			element.attr2 = "hi!";
			element.attr3 = true;

			var result = element.matches({
				attr1: "!=2"
			});

			expect(result).toBe(true);

		});

		it("unmatching integer diff comparison", function(){

			var element = CC.new("#Element");
			element.attr1 = 3;
			element.attr2 = "hi!";
			element.attr3 = true;

			var result = element.matches({
				attr1: "!=3"
			});

			expect(result).toBe(false);

		});


		it("match recursively", function(){

			var element = CC.new("#Element");
			element.attr1 = { a: 3, b: { c: "hi!"}};

			var result = element.matches({
				attr1: {
					a: 3
				}
			});

			expect(result).toBe(true);

		});


		it("match multiple attributes", function(){

			var element = CC.new("#Element");
			element.attr1 = { a: 3, b: { c: "hi!"}};

			var result = element.matches({
				attr1: {
					a: 3,
					b: {
						c: "hi!"
					}
				}
			});

			expect(result).toBe(true);

		});

		it("dont match inexistent attributes", function(){

			var element = CC.new("#Element");
			element.attr1 = { a: 3, b: { c: "hi!"}};

			var result = element.matches({
				attr1: {
					d: {}	
				}
			});

			expect(result).toBe(false);

		});

	});

	//merge was tested in "objectTools.js"

	describe("removeClass", function(){

		it("removes the class properly", function(){

			var triggeredTimes = 0;

			var el = CC.new("#El Heya");
			el.bind("removeClass.Heya", function(){
				triggeredTimes++;
			});

			expect(triggeredTimes).toBe(0);
			expect(el.classes["Heya"]).toBeDefined();
			el.removeClass("Heya");
			expect(el.classes["Heya"]).not.toBeDefined();
			expect(triggeredTimes).toBe(1);
			el.trigger("removeClass.Heya");
			expect(triggeredTimes).toBe(1);//the bind was removed

		});

		it("dont remove the class if it doesnt exist", function(){

			var triggeredTimes = 0;

			var el = CC.new("#El");
			var ccev = el.bind("removeClass.Heya", function(){
				triggeredTimes++;
			});

			expect(triggeredTimes).toBe(0);
			el.removeClass("Heya");
			expect(triggeredTimes).toBe(0);
			el.trigger("removeClass.Heya");
			expect(triggeredTimes).toBe(1);

			ccev.unbind();

		});

	});

	describe("became", function(){

		it("triggers when the element matches", function(){

			var triggeredTimes = 0;

			CC.startLoop();

			var el = CC.new("#El");
			
			var ccev = el.became({
				a: 30,
				b: "hey"
			},function(){
				triggeredTimes++;
			});

			el.a = 15;

			waits(100);

			runs(function(){
				expect(triggeredTimes).toBe(0);
				el.b = "ho";
			});

			waits(100);

			runs(function(){
				expect(triggeredTimes).toBe(0);
				el.a = 30;
			});

			waits(100);

			runs(function(){
				expect(triggeredTimes).toBe(0);
				el.b = "hey";
			});

			waits(100);

			runs(function(){
				expect(triggeredTimes).toBe(1);
				CC.stopLoop();
				ccev.unbind();
			});

		});

	});

	describe("while", function(){

		it("triggers many times while the element matches", function(){

			var triggeredTimes = 0;

			CC.startLoop();

			var el = CC.new("#El");
			
			var ccev = el.while({
				a: 30,
				b: "hey"
			},function(){
				triggeredTimes++;
			});

			el.a = 15;

			waits(100);

			runs(function(){
				expect(triggeredTimes).toBe(0);
				el.b = "ho";
			});

			waits(100);

			runs(function(){
				expect(triggeredTimes).toBe(0);
				el.a = 30;
			});

			waits(100);

			runs(function(){
				expect(triggeredTimes).toBe(0);
				el.b = "hey";
			});

			waits(100);

			var triggeredTimesStopAt;
			runs(function(){
				triggeredTimesStopAt = triggeredTimes;
				expect(triggeredTimes > 1).toBe(true);
				el.b = "hoo";
			});

			waits(100);

			runs(function(){
				expect(triggeredTimes).toBe(triggeredTimesStopAt);
				CC.stopLoop();
				ccev.unbind();
			});

		});

	});

	describe("onClick", function(){

		it("only triggers if it is clicked in the right place", function(){
			var triggeredTimes = 0;

			var el = CC.new("#El", {
				x: 60,
				y: 90,
				w: 30,
				h: 30
			});

			el.onClick(function(){
				triggeredTimes++;
			});

			expect(triggeredTimes).toBe(0);

			CC.trigger("click", {
				offsetX: 70,
				offsetY: 100
			});

			expect(triggeredTimes).toBe(1);

			CC.trigger("click", {
				offsetX: 50,
				offsetY: 100
			});

			expect(triggeredTimes).toBe(1);
		});

	});

	describe("hideAllLayers", function(){

		it("hides all layers", function(){
			var el = CC.new("#El");

			el.layers = {
				layer1: {},
				layer2: {},
				layer3: {}
			};

			el.hideAllLayers();

			expect(el.layers.layer1.hidden).toBe(true);
			expect(el.layers.layer2.hidden).toBe(true);
			expect(el.layers.layer3.hidden).toBe(true);
		});

	});

	describe("toggleLayers", function(){

		it("hides the first layer and shows the second", function(){
			var el = CC.new("#El");

			el.layers = {
				layer1: {},
				layer2: { hidden: true },
				layer3: {}
			};

			el.toggleLayers("layer3", "layer2");

			expect(el.layers.layer1.hidden).not.toBeDefined();
			expect(el.layers.layer2.hidden).toBe(false);
			expect(el.layers.layer3.hidden).toBe(true);
		});

	});

});