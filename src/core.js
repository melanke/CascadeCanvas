/***** CORE *****/

//depends on element and elementlist
//is dependency of all classes

var elementMap = {} //elements stored by id
,   elementsSize = 0
,   canvas = document.getElementById('CascadeCanvas') || {};




/**
* returns a collection of elements that match the string passed as argument
* @param selector '*' to select all, '#elementId' to select the element by id 'elementId', 
* 'Class1 Class2' to select elements that contain both classes 'Class1' and 'Class2'
*/
var CC = function(selector){

    if (selector.indexOf("*") != -1) {
        var asArray = [];
        for (var e in elementMap) {
            asArray.push(elementMap[e]);
        }

        return new ElementList(asArray, selector);
    }

    var id;

    var idArray = selector.match(/#[a-zA-Z0-9]*/);

    if (idArray) {
        id = idArray[0];
    }

    var classes = selector.replace(/#[a-zA-Z0-9]*/, "").split(" ");

    var selecteds = [];

    for (var i in elementMap) {
        var e = elementMap[i];

        if (id && id != e.id) { 
            //if we are selecting by id and it dont have the desired id: pass
            continue;
        }

        var add = true;

        for (var j in classes) {
            var c = classes[j];

            if (c.length && !e.classes[c]) { 
                //if the element dont have all classes we are looking for: pass
                add = false;
                break;

            }
        }

        if (add) {
            selecteds.push(e);
        }

    }

    //else: return all items as a Collection
    return new ElementList(selecteds, selector);

};




CC.screen = { x:0, y:0 }; //the area of the screen
CC.classes = {}; //defined classes expecting to be instantiated
CC.context = canvas.getContext && canvas.getContext('2d');
CC.step = 0; //each loop increments the step, it is used for animation proposes
CC.fn = {}; //functions that elementlist and element implement (global methods)
CC.tiles = {};




/**
* creates an element and put it in the canvas
* @param specs a string where you can specify the id and the classes it inherit, example:
* '#elementId Class1 Class2' - it will have id: elementId and will inherit Class1 and Class2
* @opts an object with params that can be used in the class constructor, will affect all inherited classes
*/
CC.new = function(specs, opts){

    var element = new Element(specs, opts);
    elementMap[element.id ? element.id : elementsSize++] = element;

    return element;
};

/**
* defines a class to be inherited
* @param classesStr a string with the name of the classes that will have tis behaviour, example:
* 'Class1 Class2' - those 2 classes will have this behaviour
* @param constructor a function that will be used as constructor
*/
CC.def = function(classesStr, constructor){
    var classes = classesStr.split(" ");

    for (var i in classes) {
        var c = classes[i];

        if (c.length) {
            if (!CC.classes[c]) {
                CC.classes[c] = {
                    constructors: []
                };
            }

            CC.classes[c].constructors.push(constructor);
        }
    }
};

/**
* erase all information in CascadeCanvas
*/
CC.clear = function() {

    CC.classes = {};
    elementMap = {};
    elementsSize = 0;
    CC.clearEvents();

};

/**
* forget about this, you should not use it
*/
CC.___remove = function(el){

    el.trigger("remove");

    for (var i in elementMap) {
        if (elementMap[i] == el) {
            delete elementMap[i];
        }
    }

};




canvas.onselectstart = function() { return false; }; //prevent canvas selection
