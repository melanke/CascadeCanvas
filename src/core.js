/***** CORE *****/

//depends on element and elementlist
//is dependency of all classes

var CC;

(function(){
    
    var elementMap = {}, //elements stored by id
        elementsSize = 0,
        lazyElements = [], //used to find elements of area faster
        notLazyElements = [], //elements that will be searched everytime
        chunkSize = 800; //size of the chunk of area search




    /**
    * returns a collection of elements that match the string passed as argument
    * @param selector '*' to select all, '#elementId' to select the element by id 'elementId', 
    * 'Class1 Class2' to select elements that contain both classes 'Class1' and 'Class2'
    */
    CC = function(selector){

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



    CC.classes = {}; //defined classes expecting to be instantiated




    /**
    * creates an element and put it in the canvas
    * @param specs a string where you can specify the id and the classes it inherit, example:
    * '#elementId Class1 Class2' - it will have id: elementId and will inherit Class1 and Class2
    * @opts an object with params that can be used in the class constructor, will affect all inherited classes
    */
    CC.new = function(specs, opts){

        if (opts && opts.lazy === true && opts.fixedOnScreen) {
            delete opts.lazy;
            console && console.warn("fixedOnScreen elements should not be lazy!");
        }

        var element = new Element(specs, opts);
        elementMap[element.id ? element.id : elementsSize++] = element;

        if (opts && opts.lazy === true && element.x !== undefined && element.y !== undefined) {
            var cX = parseInt(element.x / chunkSize);
            var cY = parseInt(element.y / chunkSize);

            if (!lazyElements[cX]) {
                lazyElements[cX] = [];
            }

            if (!lazyElements[cX][cY]) {
                lazyElements[cX][cY] = [];
            }

            lazyElements[cX][cY].push(element);
        } else {
            notLazyElements.push(element);
        }

        return element;
    };

    /**
    * defines a class to be inherited
    * @param classesStr a string with the name of the classes that will have tis behaviour, example:
    * 'Class1 Class2' - those 2 classes will have this behaviour
    * @param constructor a function that will be used as constructor
    */
    CC.def = function(classesStr, constructor){
        if (!CC.isString(classesStr) || !CC.isFunction(constructor)) {
            return;
        }

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
        lazyElements = [];
        notLazyElements = [];
        CC.clearEvents();

    };

    /**
    * removes an element
    */
    CC.remove = function(el){

        el.trigger("remove");

        for (var i in elementMap) {
            if (elementMap[i] == el) {
                delete elementMap[i];
            }
        }

        for (var j in notLazyElements) {
            if (notLazyElements[j] == el) {
                delete notLazyElements[j];
            }
        }

        var cX = parseInt(el.x / chunkSize);
        var cY = parseInt(el.y / chunkSize);   

        if (lazyElements[cX] && lazyElements[cX][cY]) {
            for (var k in lazyElements) {
                if (lazyElements[cX][cY][k] == el) {
                    delete lazyElements[cX][cY][k];
                }
            }
        }     

    };

    CC.areaSearch = function(area) {

        if (area == null || area.x === undefined || area.y === undefined || area.w === undefined || area.h == undefined) {
            return null;
        }

        var selecteds = [];

        //LAZY ELEMENTS
        var fromCX = parseInt(area.x / chunkSize) -1;
        var fromCY = parseInt(area.y / chunkSize) -1;
        var toCX = parseInt((area.x + area.w) / chunkSize) +1;
        var toCY = parseInt((area.y + area.h) / chunkSize) +1;
        
        for (var cX = fromCX; cX <= toCX; cX++) {
            for (var cY = fromCY; cY <= toCY; cY++) {
                if (lazyElements[cX] && lazyElements[cX][cY]) {
                    var c = lazyElements[cX][cY];

                    populateElementsInsideArea(c, selecteds, area);
                }
            }
        }

        //NOT LAZY
        populateElementsInsideArea(notLazyElements, selecteds, area);

        return new ElementList(selecteds, "area: "+JSON.stringify(area));

    };

    var populateElementsInsideArea = function(from, to, area) {

        for (var i in from) {
            var el = from[i];

            if (area.includeFixedOnScreen)
            { 
                if (area.includeFixedOnScreen === el.fixedOnScreen) {
                    to.push(el);
                    continue;
                } else if (el.fixedOnScreen){
                    continue;
                }

            }

            var w = el.w || 0;
            var h = el.h || 0;
            
            if (!(el.x > area.x + area.w || 
                   el.x + w < area.x || 
                   el.y > area.y + area.w ||
                   el.y + h < area.y))
            {
                to.push(el);
            }
        }

    };

    CC.level = function(description, startX, startY, tileW, tileH) {

        if (CC.isObject(description)) {

            for (var specs in description) {
                var optsArr = description[specs];

                for (var i in optsArr) {
                    CC.new(specs, optsArr[i]);
                }
            }

        } else if (CC.isArray(description)) {
            
            if (startX === undefined
             || startY === undefined
              || tileW === undefined
              || tileH === undefined)
            {
                return;
            }

            var y = startY;
            for (var l in description) {
                var line = description[l];
                var x = startX;

                for (var i in line) {

                    CC.new(line[i], {
                        x: x,
                        y: y,
                        w: tileW,
                        h: tileH
                    });

                    x += tileW;
                }

                y += tileH;
            }

        }

    };

})();