describe("keyboard.js", function(){

	var triggerKeyDown = function(keyCode) {
		var eventObj = document.createEventObject ?
        document.createEventObject() : document.createEvent("Events");
  
	    if(eventObj.initEvent){
	      eventObj.initEvent("keydown", true, true);
	    }
	  
	    eventObj.keyCode = keyCode;
	    eventObj.which = keyCode;
	    
	    window.dispatchEvent ? window.dispatchEvent(eventObj) : window.fireEvent("onkeydown", eventObj); 
	};

	var triggerKeyUp = function(keyCode) {
		var eventObj = document.createEventObject ?
        document.createEventObject() : document.createEvent("Events");
  
	    if(eventObj.initEvent){
	      eventObj.initEvent("keyup", true, true);
	    }
	  
	    eventObj.keyCode = keyCode;
	    eventObj.which = keyCode;
	    
	    window.dispatchEvent ? window.dispatchEvent(eventObj) : window.fireEvent("onkeydown", eventObj); 
	};

	var numberOfEventCalls;

	beforeEach(function(){
		numberOfEventCalls = 0;
	});

	it("is no key pressed until we press it", function(){
		expect(CC.isNoKeyPressed()).toBe(true);
		triggerKeyDown(13);
		expect(CC.isNoKeyPressed()).toBe(false);
		triggerKeyUp(13);
		expect(CC.isNoKeyPressed()).toBe(true);
	});

	it("is the right key pressed", function(){
		expect(CC.isKeysPressed("enter")).toBe(false);
		triggerKeyDown(13);
		expect(CC.isKeysPressed("enter")).toBe(true);
		triggerKeyDown(48);
		expect(CC.isKeysPressed("enter")).toBe(true);
		triggerKeyUp(13);
		expect(CC.isKeysPressed("enter")).toBe(false);
		triggerKeyUp(48);

		expect(CC.isKeysPressed("CTRL + SHIFT + A")).toBe(false);
		triggerKeyDown(17);
		expect(CC.isKeysPressed("CTRL + SHIFT + A")).toBe(false);
		triggerKeyDown(16);
		expect(CC.isKeysPressed("CTRL + SHIFT + A")).toBe(false);
		triggerKeyDown(65);
		expect(CC.isKeysPressed("CTRL + SHIFT + A")).toBe(true);
		triggerKeyDown(66);
		expect(CC.isKeysPressed("CTRL + SHIFT + A")).toBe(true);
		triggerKeyUp(17);
		expect(CC.isKeysPressed("CTRL + SHIFT + A")).toBe(false);
		triggerKeyUp(16);
		triggerKeyUp(65);
		triggerKeyUp(66);

		//alias
		expect(CC.isKeysPressed("CMD")).toBe(false);
		expect(CC.isKeysPressed("WIN")).toBe(false);
		triggerKeyDown(91);
		expect(CC.isKeysPressed("CMD")).toBe(true);
		expect(CC.isKeysPressed("WIN")).toBe(true);
		triggerKeyDown(48);
		expect(CC.isKeysPressed("CMD")).toBe(true);
		expect(CC.isKeysPressed("WIN")).toBe(true);
		triggerKeyUp(91);
		expect(CC.isKeysPressed("CMD")).toBe(false);
		expect(CC.isKeysPressed("WIN")).toBe(false);
		triggerKeyUp(48);
	});


	it("is the only key pressed right", function(){
		expect(CC.isKeysPressedOnly("enter")).toBe(false);
		triggerKeyDown(13);
		expect(CC.isKeysPressedOnly("enter")).toBe(true);
		triggerKeyDown(48);
		expect(CC.isKeysPressedOnly("enter")).toBe(false);
		triggerKeyUp(48);
		expect(CC.isKeysPressedOnly("enter")).toBe(true);
		triggerKeyUp(13);
		expect(CC.isKeysPressedOnly("enter")).toBe(false);

		expect(CC.isKeysPressedOnly("CTRL + SHIFT + A")).toBe(false);
		triggerKeyDown(17);
		expect(CC.isKeysPressedOnly("CTRL + SHIFT + A")).toBe(false);
		triggerKeyDown(16);
		expect(CC.isKeysPressedOnly("CTRL + SHIFT + A")).toBe(false);
		triggerKeyDown(65);
		expect(CC.isKeysPressedOnly("CTRL + SHIFT + A")).toBe(true);
		triggerKeyDown(66);
		expect(CC.isKeysPressedOnly("CTRL + SHIFT + A")).toBe(false);
		triggerKeyUp(66);
		expect(CC.isKeysPressedOnly("CTRL + SHIFT + A")).toBe(true);
		triggerKeyUp(17);
		expect(CC.isKeysPressedOnly("CTRL + SHIFT + A")).toBe(false);
		triggerKeyUp(16);
		triggerKeyUp(65);


		//alias
		expect(CC.isKeysPressedOnly("CMD")).toBe(false);
		expect(CC.isKeysPressedOnly("WIN")).toBe(false);
		triggerKeyDown(91);
		expect(CC.isKeysPressedOnly("CMD")).toBe(true);
		expect(CC.isKeysPressedOnly("WIN")).toBe(true);

		triggerKeyDown(48);
		expect(CC.isKeysPressedOnly("CMD")).toBe(false);
		expect(CC.isKeysPressedOnly("WIN")).toBe(false);
		triggerKeyUp(91);
		expect(CC.isKeysPressedOnly("CMD")).toBe(false);
		expect(CC.isKeysPressedOnly("WIN")).toBe(false);
		triggerKeyUp(48);
	});

	it("calls onkeydown in the right moments", function(){
		var ccevt = CC.onKeysDown("enter", function(){
			numberOfEventCalls++;
		});

		expect(numberOfEventCalls).toBe(0);
		triggerKeyDown(48);
		expect(numberOfEventCalls).toBe(0);
		triggerKeyDown(13);
		expect(numberOfEventCalls).toBe(1);
		triggerKeyDown(49);
		expect(numberOfEventCalls).toBe(1);
		triggerKeyUp(13);
		triggerKeyUp(48);
		triggerKeyUp(49);
		expect(numberOfEventCalls).toBe(1);

		ccevt.unbind();

		var ccevt2 = CC.onKeysDown("CTRL + SHIFT + A", function(){
			numberOfEventCalls++;
		});

		expect(numberOfEventCalls).toBe(1);
		triggerKeyDown(17);
		expect(numberOfEventCalls).toBe(1);
		triggerKeyDown(16);
		expect(numberOfEventCalls).toBe(1);
		triggerKeyDown(65);
		expect(numberOfEventCalls).toBe(2);
		triggerKeyDown(48);
		expect(numberOfEventCalls).toBe(2);
		triggerKeyUp(65);
		triggerKeyDown(65);
		expect(numberOfEventCalls).toBe(3);
		triggerKeyUp(17);
		triggerKeyUp(16);
		triggerKeyUp(65);
		triggerKeyUp(48);
		expect(numberOfEventCalls).toBe(3);

		ccevt2.unbind();

		//alias
		var ccevt3 = CC.onKeysDown("CMD", function(){
			numberOfEventCalls++;
		});

		expect(numberOfEventCalls).toBe(3);
		triggerKeyDown(91);
		expect(numberOfEventCalls).toBe(4);
		triggerKeyDown(16);
		expect(numberOfEventCalls).toBe(4);
		triggerKeyUp(91);
		triggerKeyUp(16);


		ccevt3.unbind();
	});

	it("calls onkeysdownonly in the right moments", function(){
		var ccevt = CC.onKeysDownOnly("enter", function(){
			numberOfEventCalls++;
		});

		expect(numberOfEventCalls).toBe(0);
		triggerKeyDown(48);
		expect(numberOfEventCalls).toBe(0);
		triggerKeyDown(13);
		expect(numberOfEventCalls).toBe(0);
		triggerKeyUp(48);
		triggerKeyDown(13);
		expect(numberOfEventCalls).toBe(1);
		triggerKeyUp(13);

		ccevt.unbind();
	});

	it("calls onkeysuponly in the right moments", function(){
		var ccevt = CC.onKeysUpOnly("enter", function(){
			numberOfEventCalls++;
		});

		expect(numberOfEventCalls).toBe(0);
		triggerKeyDown(13);
		expect(numberOfEventCalls).toBe(0);
		triggerKeyUp(13);
		expect(numberOfEventCalls).toBe(1);

		ccevt.unbind();


		var ccevt2 = CC.onKeysUpOnly("CTRL + SHIFT + A", function(){
			numberOfEventCalls++;
		});

		expect(numberOfEventCalls).toBe(1);
		triggerKeyDown(17);
		triggerKeyDown(16);
		triggerKeyDown(65);
		expect(numberOfEventCalls).toBe(1);
		triggerKeyUp(17);
		expect(numberOfEventCalls).toBe(2);
		triggerKeyDown(17);
		triggerKeyDown(48);
		triggerKeyUp(65);
		expect(numberOfEventCalls).toBe(2);
		triggerKeyDown(65);
		triggerKeyUp(48);
		triggerKeyUp(16);
		expect(numberOfEventCalls).toBe(3);
		triggerKeyUp(17);
		triggerKeyUp(65);
		expect(numberOfEventCalls).toBe(3);

		ccevt2.unbind();

		var ccevt3 = CC.onKeysUpOnly("CMD", function(){
			numberOfEventCalls++;
		});

		expect(numberOfEventCalls).toBe(3);
		triggerKeyDown(91);
		expect(numberOfEventCalls).toBe(3);
		triggerKeyUp(91);
		expect(numberOfEventCalls).toBe(4);

		ccevt3.unbind();
	});

	it("calls onKeysSequence in the right moments", function(){

		var ccevt = CC.onKeysSequence(["CTRL", "SHIFT", "CMD"], 500, function(){
			numberOfEventCalls++;
		});

		expect(numberOfEventCalls).toBe(0);
		triggerKeyDown(17);
		triggerKeyUp(17);
		triggerKeyDown(16);
		triggerKeyUp(16);
		triggerKeyDown(91);
		triggerKeyUp(91);
		expect(numberOfEventCalls).toBe(1);

		triggerKeyDown(17);
		triggerKeyUp(17);
		triggerKeyDown(16);
		triggerKeyUp(16);
		triggerKeyDown(48);
		triggerKeyUp(48);
		triggerKeyDown(91);
		triggerKeyUp(91);
		expect(numberOfEventCalls).toBe(1);
		
		//timeout
		triggerKeyDown(17);
		triggerKeyUp(17);
		triggerKeyDown(16);
		triggerKeyUp(16);

		waits(501);

		runs(function(){
			triggerKeyDown(91);
			triggerKeyUp(91);
			expect(numberOfEventCalls).toBe(1);
		});

		ccevt.unbind();

	});

});