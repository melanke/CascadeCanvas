describe("event.js", function(){

	describe("binding global event with eventname", function(){

		var timesTriggeredWhenBinded;

		beforeEach(function(){

			CC.clear();
			timesTriggeredWhenBinded = 0;

			CC.bind("eventname", function(){
				timesTriggeredWhenBinded++;
			});

		});

		it("is able to trigger with eventname", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.trigger("eventname");

			expect(timesTriggeredWhenBinded).toBe(1);

		});

		it("is not able to trigger with another eventname", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.trigger("othereventname");

			expect(timesTriggeredWhenBinded).toBe(0);

		});

		it("is not able to trigger a event of a element", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC("#elementid").trigger("eventname");

			expect(timesTriggeredWhenBinded).toBe(0);

		});

		it("is not able to trigger with a namespace", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(0);

		});

		it("is not able to trigger with a dot", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.trigger(".");

			expect(timesTriggeredWhenBinded).toBe(0);

		});

	});

	describe("binding global event with eventname and namespace", function(){

		var timesTriggeredWhenBinded;

		beforeEach(function(){

			CC.clear();
			timesTriggeredWhenBinded = 0;

			CC.bind("eventname.namespace", function(){
				timesTriggeredWhenBinded++;
			});

		});

		it("is able to trigger with eventname", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.trigger("eventname");

			expect(timesTriggeredWhenBinded).toBe(1);

		});

		it("is not able to trigger with another eventname", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.trigger("othereventname");

			expect(timesTriggeredWhenBinded).toBe(0);

		});

		it("is able to trigger with eventname and namespace", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(1);

		});

		it("is not able to trigger with another namespace", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.trigger("eventname.othernamespace");

			expect(timesTriggeredWhenBinded).toBe(0);

		});

		it("is not able to trigger with another eventname but same namespace", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.trigger("othereventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(0);

		});

		it("is not able to trigger just by namespace", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.trigger(".namespace");

			expect(timesTriggeredWhenBinded).toBe(0);

		});

	});

	describe("unbinding global event binded with eventname", function(){

		var timesTriggeredWhenBinded;
		var action = function(){
			timesTriggeredWhenBinded++;
		};

		beforeEach(function(){

			CC.clear();
			timesTriggeredWhenBinded = 0;

			CC.bind("eventname", action);

		});

		it("is able to unbind with eventname", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.unbind("eventname");
			CC.trigger("eventname");

			expect(timesTriggeredWhenBinded).toBe(0);

		});

		it("is not able to unbind with another eventname", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.unbind("othereventname");
			CC.trigger("eventname");

			expect(timesTriggeredWhenBinded).toBe(1);

		});

		it("is not able to unbind with another namespace", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.bind("eventname.namespace");
			CC.trigger("eventname");

			expect(timesTriggeredWhenBinded).toBe(1);

		});

		it("is able to unbind with eventname and action", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.unbind("eventname", action);
			CC.trigger("eventname");

			expect(timesTriggeredWhenBinded).toBe(0);

		});

		it("is not able to unbind with eventname and other action", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.unbind("eventname", function(){
				timesTriggeredWhenBinded++;
			});

			CC.trigger("eventname");

			expect(timesTriggeredWhenBinded).toBe(1);

		});

	});

	 describe("unbinding global event binded with eventname and namespace", function(){

	 	var timesTriggeredWhenBinded;
		var action = function(){
			timesTriggeredWhenBinded++;
		};

	 	beforeEach(function(){

			CC.clear();
			timesTriggeredWhenBinded = 0;

			CC.bind("eventname.namespace", action);

		});

		it("is able to unbind with eventname", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.unbind("eventname");
			CC.trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(0);

		});

		it("is not able to unbind with another eventname", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.unbind("othereventname");
			CC.trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(1);

		});

		it("is able to unbind with eventname and namespace", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.unbind("eventname.namespace");
			CC.trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(0);

		});

		it("is not able to unbind with another namespace", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.unbind("eventname.othernamespace");
			CC.trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(1);

		});

		it("is able to unbind with namespace", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.unbind(".namespace");
			CC.trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(0);

		});


		it("is able to unbind with eventname and action", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.unbind("eventname", action);
			CC.trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(0);

		});


		it("is not able to unbind with eventname and different action", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.unbind("eventname", function(){
				timesTriggeredWhenBinded++;
			});
			CC.trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(1);

		});

		it("is not able to unbind with another eventname but right action", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.unbind("othereventname", action);
			CC.trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(1);

		});

		it("is able to unbind with eventname, namespace and action", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.unbind("eventname.namespace", action);
			CC.trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(0);

		});

		it("is not able to unbind with eventname, namespace and different action", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.unbind("eventname.namespace", function(){
				timesTriggeredWhenBinded++;
			});
			CC.trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(1);

		});

		it("is not able to unbind with another namespace and right action", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.unbind("eventname.othernamespace", action);
			CC.trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(1);

		});

		it("is able to unbind with namespace and action", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.unbind(".namespace", action);
			CC.trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(0);

		});

		it("is not able to unbind with namespace and different action", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.unbind(".namespace", function(){
				timesTriggeredWhenBinded++;
			});
			CC.trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(1);

		});

	});

	describe("binding element event with eventname", function(){

		var timesTriggeredWhenBinded;

		beforeEach(function(){

			CC.clear();
			timesTriggeredWhenBinded = 0;

			CC.new("#element").bind("eventname", function(){
				timesTriggeredWhenBinded++;
			});

		});

		it("is able to trigger with eventname", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC("#element").trigger("eventname");

			expect(timesTriggeredWhenBinded).toBe(1);

		});

		it("is not able to trigger with eventname of other element", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC("#otherelement").trigger("eventname");

			expect(timesTriggeredWhenBinded).toBe(0);

		});

		it("is not able to trigger like a global event", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.trigger("eventname");

			expect(timesTriggeredWhenBinded).toBe(0);

		});

		it("is not able to trigger with another eventname", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC("#element").trigger("othereventname");

			expect(timesTriggeredWhenBinded).toBe(0);

		});

		it("is not able to trigger with another namespace", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC("#element").trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(0);

		});

		it("is not able to trigger with a dot", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC("#element").trigger(".");

			expect(timesTriggeredWhenBinded).toBe(0);

		});

	});

	describe("binding element event with eventname and namespace", function(){

		var timesTriggeredWhenBinded;

		beforeEach(function(){

			CC.clear();
			timesTriggeredWhenBinded = 0;

			CC.new("#element").bind("eventname.namespace", function(){
				timesTriggeredWhenBinded++;
			});

		});

		it("is able to trigger with eventname", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC("#element").trigger("eventname");

			expect(timesTriggeredWhenBinded).toBe(1);

		});

		it("is not able to trigger with another eventname", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC("#element").trigger("othereventname");

			expect(timesTriggeredWhenBinded).toBe(0);

		});

		it("is able to trigger with eventname and namespace", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC("#element").trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(1);

		});

		it("is not able to trigger event of other element with eventname and namespace", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC("#otherelement").trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(0);

		});

		it("is not able to trigger with another namespace", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC("#element").trigger("eventname.othernamespace");

			expect(timesTriggeredWhenBinded).toBe(0);

		});

		it("is not able to trigger with another eventname but same namespace", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC("#element").trigger("othereventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(0);

		});

		it("is not able to trigger just with namespace", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC("#element").trigger(".namespace");

			expect(timesTriggeredWhenBinded).toBe(0);

		});

	});

	describe("unbinding element event binded with eventname", function(){

		var timesTriggeredWhenBinded;
		var action = function(){
			timesTriggeredWhenBinded++;
		};

		beforeEach(function(){

			CC.clear();
			timesTriggeredWhenBinded = 0;

			CC.new("#element").bind("eventname", action);

		});

		it("is able to unbind with eventname", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC("#element").unbind("eventname");
			CC("#element").trigger("eventname");

			expect(timesTriggeredWhenBinded).toBe(0);

		});

		it("is not able to unbind  with eventname like a global event", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.unbind("eventname");
			CC("#element").trigger("eventname");

			expect(timesTriggeredWhenBinded).toBe(1);

		});

		it("is not able to unbind with another eventname", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC("#element").unbind("othereventname");
			CC("#element").trigger("eventname");

			expect(timesTriggeredWhenBinded).toBe(1);

		});

		it("is not able to unbind with another namespace", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC("#element").bind("eventname.namespace");
			CC("#element").trigger("eventname");

			expect(timesTriggeredWhenBinded).toBe(1);

		});

		it("is able to unbind with eventname and action", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC("#element").unbind("eventname", action);
			CC("#element").trigger("eventname");

			expect(timesTriggeredWhenBinded).toBe(0);

		});

		it("is not able to unbind with eventname and action like a global event", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.unbind("eventname", action);
			CC("#element").trigger("eventname");

			expect(timesTriggeredWhenBinded).toBe(1);

		});

		it("is not able to unbind with eventname and other action", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC("#element").unbind("eventname", function(){
				timesTriggeredWhenBinded++;
			});

			CC("#element").trigger("eventname");

			expect(timesTriggeredWhenBinded).toBe(1);

		});

	});

	 describe("unbinding element event binded with eventname and namespace", function(){

	 	var timesTriggeredWhenBinded;
		var action = function(){
			timesTriggeredWhenBinded++;
		};

	 	beforeEach(function(){

			CC.clear();
			timesTriggeredWhenBinded = 0;

			CC.new("#element").bind("eventname.namespace", action);

		});

		it("is able to unbind with eventname", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC("#element").unbind("eventname");
			CC("#element").trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(0);

		});

		it("is not able to unbind with eventname like a global event", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.unbind("eventname");
			CC("#element").trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(1);

		});

		it("is not able to unbind with another eventname", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC("#element").unbind("othereventname");
			CC("#element").trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(1);

		});

		it("is able to unbind with eventname and namespace", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC("#element").unbind("eventname.namespace");
			CC("#element").trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(0);

		});

		it("is not able to unbind with eventname and namespace like a global event", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.unbind("eventname.namespace");
			CC("#element").trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(1);

		});

		it("is not able to unbind with another namespace", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC("#element").unbind("eventname.othernamespace");
			CC("#element").trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(1);

		});

		it("is able to unbind with namespace", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC("#element").unbind(".namespace");
			CC("#element").trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(0);

		});

		it("is not able to unbind with namespace like a global event", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.unbind(".namespace");
			CC("#element").trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(1);

		});


		it("is able to unbind with eventname and action", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC("#element").unbind("eventname", action);
			CC("#element").trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(0);

		});

		it("is not able to unbind with eventname and action like a global event", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.unbind("eventname", action);
			CC("#element").trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(1);

		});


		it("is not able to unbind with eventname and different action", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC("#element").unbind("eventname", function(){
				timesTriggeredWhenBinded++;
			});
			CC("#element").trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(1);

		});

		it("is not able to unbind with another eventname but right action", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC("#element").unbind("othereventname", action);
			CC("#element").trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(1);

		});

		it("is able to unbind with eventname, namespace and action", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC("#element").unbind("eventname.namespace", action);
			CC("#element").trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(0);

		});

		it("is not able to unbind with eventname, namespace and action like a global event", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.unbind("eventname.namespace", action);
			CC("#element").trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(1);

		});

		it("is not able to unbind with eventname, namespace and different action", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC("#element").unbind("eventname.namespace", function(){
				timesTriggeredWhenBinded++;
			});
			CC("#element").trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(1);

		});

		it("is not able to unbind with another namespace and right action", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC("#element").unbind("eventname.othernamespace", action);
			CC("#element").trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(1);

		});

		it("is able to unbind with namespace and action", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC("#element").unbind(".namespace", action);
			CC("#element").trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(0);

		});

		it("is not able to unbind with namespace and action like a global event", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC.unbind(".namespace", action);
			CC("#element").trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(1);

		});

		it("is not able to unbind with namespace and different action", function(){

			expect(timesTriggeredWhenBinded).toBe(0);

			CC("#element").unbind(".namespace", function(){
				timesTriggeredWhenBinded++;
			});
			CC("#element").trigger("eventname.namespace");

			expect(timesTriggeredWhenBinded).toBe(1);

		});

	});

});