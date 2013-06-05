CascadeCanvas
=============


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
var marioB = CC.("#mario");



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
* returns true if this element matches the specification
*/
var isBulbasaur = CC("Pokemon").matches({
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

//TODO: tell about: addDrawShape, removeDrawShape, addCustomDrawer, each, eg, asArray

```
