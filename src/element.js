/***** ELEMENT *****/

//depends on typeChecker, objectTools, event, resource
//is dependency of elementlist

/**
* the base element, all elements inherit this
*/
var Element = function(specs, opts){

    var el = this,
        thisevents = {}, //events attached to this
        removed = false; //an extra protection to ignore removed elements

    this.classes = {}; //classes this inherits
    this.layers = {}; //a Map of layers or functions by name to be draw

    /**
    * routine for initialization:
    *  - set its ID
    *  - make it inherit the classes
    */
    var init = function(){

        var idArray = specs.match(/#[a-zA-Z0-9]*/);

        if (idArray) {
            el.id = idArray[0];
        }

        if (opts) {
            el.x = opts.x;
            el.y = opts.y;
            el.w = opts.w;
            el.h = opts.h;
            el.angle = opts.angle;
            el.anchor = opts.anchor;
            el.flip = opts.flip;
            el.hidden = opts.hidden;
            el.zIndex = opts.zIndex;
        }

        eventEnvironmentBuilder(el);

        el.inherit(specs.replace(/#[a-zA-Z0-9]*/g, ""), opts);

    };

    /**
    * invoke the constructors for this element
    * @param classesStr a string with the name of the classes to this element inherit, example:
    * 'Class1 Class2' - this element will inherit both
    */
    this.inherit = function(classesStr, opts){

        if (removed) {
            return this;
        }

        var classes = classesStr.split(" ");

        for (var i in classes) {
            var s = classes[i];

            if (s.length && !this.classes[s]) {

                this.classes[s] = CC.classes[s];

                if (CC.classes[s] && CC.classes[s].constructors) {
                        
                    for (var j in CC.classes[s].constructors) {
                        var c = CC.classes[s].constructors[j];

                        c.call(this, opts);
                    }

                } else {

                    this.classes[s] = {
                        constructors: []
                    };

                }

            }
        }

        return this;

    };

    /**
    * returns true if this element matches the specification
    * the spec could be the value you want or an expression
    * eg.: "<= 3" to check if the attribute is <= 3, the operator should be at the start
    * available operators: <, >, <=, >=, !=
    */
    this.matches = function(specs){

        var matchesRecursively = function(a, b){

            if (!a || !b) {
                return false;
            }

            for (var i in b) {

                if (a[i] === undefined) {

                    return false;

                } else if (CC.isObject(b[i])) {

                    if (matchesRecursively(a[i], b[i]) === false) {
                        return false;
                    }

                //if it is an expression we will evaluate it
                } else if ((CC.isString(b[i]))
                    && (b[i].indexOf("<") == 0 || b[i].indexOf(">") == 0 || b[i].indexOf("!=") == 0)) {

                    if (b[i].indexOf("<=") == 0 && a[i] > b[i].replace("<=", "")) {
                        return false;
                    }

                    if (b[i].indexOf("<") == 0 && a[i] >= b[i].replace("<", "")) {
                        return false;
                    }

                    if (b[i].indexOf(">=") == 0 && a[i] < b[i].replace(">=", "")) {
                        return false;
                    }

                    if (b[i].indexOf(">") == 0 && a[i] <= b[i].replace(">", "")) {
                        return false;
                    }

                    if (b[i].indexOf("!=") == 0 && a[i] == b[i].replace("!=", "")) {
                        return false;
                    }

                } else if (a[i] !== b[i]) {

                    return false;

                }

            }

            return true;

        };

        return matchesRecursively(this, specs);

    };

    /**
    * merge attributes to this element
    */
    this.merge = function(obj){

        if (removed) {
            return;
        }

        var args = [].splice.call(arguments, 0);
        args.splice(0, 0, this); //insert in fist position

        CC.merge.apply(CC, args);

        return this;
    };

    /**
    * remove the element
    */
    this.remove = function(){

        if (removed) {
            return;
        }

        removed = true;

        CC.___remove(this);

    };

    /**
    * if the class bind the event 'removeClass' the class is removed correctly
    */
    this.removeClass = function(classe){

        if (this.classes[classe] !== undefined) {
            this.trigger("removeClass."+classe);
            this.unbind("."+classe);
            delete this.classes[classe];
        }

    };

    /**
    * trigger the action when the element match the specs
    */
    this.became = function(specs, action){

        var matched = false;

        return CC.bind("enterframe", function(){

            var newmatched = el.matches(specs);

            if (!matched && newmatched) {
                action.call(el);
            }

            matched = newmatched;
        });

    };

    /**
    * trigger the action while the element match the specs
    */
    this.while = function(specs, action){

        return CC.bind("enterframe", function(){

            if (el.matches(specs)) {
                action.call(el);
            }

        });

    };

    /**
    * trigger the action when the element is clicked
    */
    this.onClick = function(action){

        return CC.bind("click", function(event){
            var x = event.offsetX;
            var y = event.offsetY;
            if (x >= el.x 
             && x <= el.x + el.w
             && y >= el.y
             && y <= el.y + el.h) {
                action.call(el);
            }
        });

    };

    this.hideAllLayers = function() {
        for (var i in this.layers) {
            this.layers[i].hidden = true;
        }
    };

    this.toggleLayers = function(toHide, toShow) {
        this.layers[toHide].hidden = true;
        this.layers[toShow].hidden = false;
    };

    init();

};