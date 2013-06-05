CascadeCanvas
=============

CascadeCanvas (CC) is an API to work with canvas rich applications (or games), drawing and organizing classes that works with mult-inheritance and will help to encapsulate behaviours to be reused to a lot of subclasses and instances. You should create classes, inherit this classes by other classes or "elements" and manipulate this classes or elements in the easiest way. It was made with the inspiration of jQuery and Crafty.

Our drawing features is in its earlydays but the idea is to do something with layers of shapes in a declarative way.

#Some features

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



/***********************************************/
/* Below a few methods of elements             */
/* and collection of elements                  */
/* those can be used inside or outside a class */
/***********************************************/



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



/***********/
/* Classes */
/***********/

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

		el.attr2 = 7; //modifing a property
	};

	//here you can use the methods described before
	this.became({
		attr1: 4	
	}, function(){
		this.attr1 = 5	
	});

	//using the params passed in constructor
	if (opts.attr2 > this.attr2) {
		this.attr6 = opts.attr2;
	}

});

//instantiating our class
var el1 = CC.new("#Element Class1", {
	attr2: 9
});

//using methods
el1.method1();



//TODO: tell about: addDrawShape, removeDrawShape, addCustomDrawer, unbind, clear

```
