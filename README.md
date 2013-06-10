CascadeCanvas
=============

CascadeCanvas (CC) is an API to work with canvas rich applications (or games), drawing and organizing classes that works with mult-inheritance and will help to encapsulate behaviours to be reused to a lot of subclasses and instances. You should create classes, inherit this classes by other classes or "elements" and manipulate this classes or elements in the easiest way. It was made with the inspiration of jQuery and Crafty.

- [Start](#start)
- [Some features](#some-features)
- [Methods of the Elements](#methods-of-the-elements)
- [Building Classes](#building-classes)
- [Drawing the element](#drawing-the-element)
- [Other features to help](#other-features-to-help)
- [CC Attributes](cc-attributes)
- [CC Plugins](cc-plugins)
- [Upcoming Features](upcoming-features)

##Start

to start, you should put the canvas element in your Html with the "CascadeCanvas" id

```html
	<canvas id="CascadeCanvas" width="800" height="600"></canvas>
```

[Download](https://raw.github.com/melanke/Watch.JS/master/cc.js) and use CascadeCanvas adding the script tag in your html

```html
	<script src="cc.js" type="text/javascript"></script>
```

CascadeCanvas can also be used with Require.js

```javascript
require(["cc.js"], function(CC){
	
});
```

##Some features

```javascript

/**
* defines a class to be inherited
* @param classesStr a string with the name of the classes that will have tis behaviour, example:
* 'Class1 Class2' - those 2 classes will have this behaviour
* @param constructor a function that will be used as constructor
*/
CC.def("Class1 Class2", function(opts){
	//class implementation
});



/**
* creates an element and put it in the canvas
* @param specs a string where you can specify the id and the classes it inherit, example:
* '#elementId Class1 Class2' - it will have id: elementId and will inherit Class1 and Class2
* @opts an object with params that can be used in the class constructor, will affect all inherited classes
*/
CC.new("#elementId Class1 Class2", {
	//opts to constructors of Class1 and Class2
});



/**
* returns a element or a collection of elements that match the string passed as argument
* @param selector '*' to select all, '#elementId' to select the element by id 'elementId', 
* 'Class1 Class2' to select elements that contain both classes 'Class1' and 'Class2'
*/
var all = CC("*");
var allClass1AndOtherClass = CC("Class1 OtherClass");
var marioB = CC("#mario");



/**
* register an action to a global event
* @param eventsStr a string with the event name and optinally a namespace
* the namespace is used to trigger, bind or unbind a section of the event
* use this capability to narrow the scope of our unbinding actions,
* example: 'eventName.namespace1'
* @param action a function to be invoked when the event is triggered
*/
CC.bind("eventName", function(){
	//do something
});

/**
* invoke all actions of a global event
* @param eventsStr a string with the event name and optinally a namespace
* the namespace is used to trigger, bind or unbind a section of the event
* use this capability to narrow the scope of our unbinding actions,
* example: 'eventName.namespace1'
*/
CC.trigger("eventName");



/**
* merge all attributes of the arguments recursively into the first argument and returns it
*/
var a = CC.merge(b, c, d); //so, a will be equal to b and will have all attributes of c and d



/**
* start the routine of the gameloop, for each loop it triggers 'enterframe' event and render the elements
*/
CC.startLoop(); //starts the fun!
```

##Methods of the Elements

Below a few methods of elements
and collection of elements
those can be used inside or outside a class

```javascript

/**
* invoke the constructors for this element
* @param classesStr a string with the name of the classes to this element inherit, example:
* 'Class1 Class2' - this element will inherit both
*/
CC("#ElementX").inherit("OutherClasse Classe1"); //#ElementX will inherit OutherClass and Class1



/**
* if we have an collection, it gets an element by the index
*/
var pokemonA = CC("Pokemon").eg(0);



/**
* invoke an action for all elements selected
*/
CC("Pokemon").each(function(){
	//do something to each pokemon using 'this'
});



/**
* returns a copy of the elements as array
*/
var pkms = CC("Pokemon").asArray();
var first = pkms[0]; //but adding or removing from this array will cause nothing



/**
* returns true if this element matches the specification
*/
var isBulbasaur = pokemonA.matches({
	pokemonId: 1
});



/**
* search for an element on the collection with the attributes specified in the parameter
*/
var bulba = CC("Pokemon").search({
	pokemonId: 1
});



/**
* merge attributes to this element
*/
CC("#ElementX").merge({
	//attributes to be incorpored
});



/**
* remove the element
*/
CC("#Trash").remove();



/**
* register an action to an attached event to this element
* @param eventsStr a string with the event name and optinally a namespace
* the namespace is used to trigger, bind or unbind a section of the event
* use this capability to narrow the scope of our unbinding actions,
* example: 'eventName.namespace1'
* @param action a function to be invoked when the event is triggered
*/
CC("#ElementX").bind("eventName", function(){ });



/**
* invoke all actions of the event attached to this element
* @param eventsStr a string with the event name and optinally a namespace
* the namespace is used to trigger, bind or unbind a section of the event
* use this capability to narrow the scope of our unbinding actions,
* example: 'eventName.namespace1'
*/
CC("#ElementX").trigger("eventName");



/**
* trigger the action when the elements match the specs
*/
CC("Pokemon").became({
	level: 16
}, function(){
	this.evolutionSequence = 2;
});

```

##Building Classes

```javascript

//classes need to be defined before instantiate or inherit them
CC.def("Class1", function(opts){
	
	//declaring a public attribute
	this.attr1 = 3;

	//declaring a private attribute
	var attr2 = 6;

	//declaring a public method
	this.method1 = function(){
		this.attr1 = 4; //modifing a property
	};

	var el = this; //to use in private methods...

	//declaring a private method
	var method2 = function(){
		//warning: 'this' will not work here inside, you will need to do closure: 
		//access a variable of the context of the class like below

		el.attr1 = 5; //modifing a property
	};

	//here you can use the methods described before
	this.became({
		attr1: 4	
	}, function(){
		this.attr1 = 5	
	});

	//using the params passed in constructor
	if (opts.attr2 > attr2) {
		attr2 = opts.attr2;
	}

});

//instantiating our class
var el1 = CC.new("#Element Class1", {
	attr2: 9
});

//using methods
el1.method1();

```

##Drawing the element

```javascript

//to draw an element you need to declare the "drawings" in the class or in the element like this
CC("#selectedEl").drawings = {
	//declaring the drawing of the element, but in this way you will override the drawings made before in classes
};

//you should always use 'merge'
CC("#selectedEl").merge({
	drawings: {

	}
});

//but would be better if you do it in the class to be reutilizated
CC.def("Class1", function(opts){

	CC.merge(this.drawings, {
		
	});

});

//BUT WHAT OPTIONS TO DRAWINGS I HAVE?
//give a name and the options of that drawing

CC.merge(this.drawings, {

	theNameOfMyDrawing: {
		zIndex: -3, //the less zIndex is the most visible it is (in the front of other drawings)
		offsetX: 10, //drawing will be 10 to the right
		offsetY: 10, //10 to the bottom
		offsetW: 10, //10 wider, 5 to each side
		offsetH: 10, //10 taller, 5 to each side
		angle: 30, //rotated 30 degrees
		anchor: { //point where the rotation will anchor
			x: 10, //x and y from element x and y
			y: 10
		},
		stroke: {
			color: "#330099", //you may choose by "color" or "linearGradient"
			thickness: 5,
			cap: "butt", //style of the ends of the line
			join: "bevel" //style of the curves of the line
		},
		fill: {
			linearGradient: { //you may choose by "color" or "linearGradient"
				start: [0, 0],
				end: [100, 100],
				"0": "rgba(200, 100, 100, 0.8)",
				"0.5": "#f00",
				"1": "#0000dd"
			}
		}
	},

	theNameOfMyOtherDrawing: function(){
		//create a custom function to draw

		CC.context.fillRect(this.x, this.y, this.x + this.w, this.y + this.h);
		//it is a simple square, a stupid example, you should use the other way to do that
	}

});


```

##Other features to help

```javascript

/**
* erase all information in CascadeCanvas
*/
CC.clear();



/**
* check if param is a function
*/
CC.isFunction(param);



/**
* check if param is a string
*/
CC.isString(param);



/**
* check if param is an array
*/
CC.isArray(param);



/**
* rotate a point
* @param p the point to be rotated
* @param anchor the anchor point
* @param angle the angle of the rotation
*/
CC.rotatePoint(p, anchor, angle);



/**
* sort the items of an array by property
* @param elements array to be sorted
* @param prop the property to compare
* @param invert if you want the reverse order
*/
CC.sort(elements, prop, invert);



/**
* make the triggers and the gameloop to be ignored
*/
CC.pause();



/**
* make the triggers and the gameloop to be considered again
*/
CC.play();



/**
* remove an action to a global event
* @param eventsStr a string with the event name and optinally a namespace
* the namespace is used to trigger, bind or unbind a section of the event
* use this capability to narrow the scope of our unbinding actions,
* example: 'eventName.namespace1'
* @param action (optional) if you dont specify the domain you can specify
* the action you want to remove
*/
CC.unbind(eventsStr, action);

```

##CC Attributes

```javascript

CC.classes; //defined classes

CC.context; //2d context of the 'CascadeCanvas' html element

CC.screen; //the area of the screen

```

##CC Plugins

The Idea of CascadeCanvas is to re-use code, I would like to see the javascript open-source community using plugins of each others to build games. If you want to publish your plugin in this list please send a issue at this repository

- [CC.Box2d](http://github.com/melanke/CC.Box2D) - An adaptor of Box2dWeb to CascadeCanvas, do things with physics or a simple collision detection

##Upcoming features

- A lot of drawing options like gradientRadial; images as sprites; animation; shape (circle, polygon maybe vectors); effects (transparency, blur, others)

- In metrics of drawings, like offsetX, you will can specify an simple calculation using percentage and pixels, eg.: "80% + 10px"

- More [CC Plugins](#cc-plugins)
