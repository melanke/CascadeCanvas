/***** ELEMENT *****/

//depends on typeChecker, objectTools, event, resource
//is dependency of elementlist

var creationCount = 0;

/**
* the base element, all elements inherit this
*/
var Element = function(specs, opts){

    var el = this,
        removed = false, //an extra protection to ignore removed elements
        creationTime = new Date().getTime(),
        creationOrder = creationCount++;

    this.classes = {}; //classes this inherits
    this.layers = {}; //a Map of layers or functions by name to be draw

    /**
    * routine for initialization:
    *  - set its ID
    *  - set the properties of the option
    *  - initialize the events
    *  - make it inherit the classes
    */
    var init = function(){

        var idArray;

        if (CC.isString(specs)) {
            idArray = specs.match(/#[a-zA-Z0-9]*/);
        }

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
            el.fixedOnScreen = opts.fixedOnScreen;

            el.clickable = opts.clickable !== false;
        }

        eventEnvironmentBuilder(el, function(){ return !removed; }); 
        //should not trigger an event if the element is removed
        bindRemoveEvent();

        if (CC.isString(specs)) {
            el.inherit(specs.replace(/#[a-zA-Z0-9]*/g, ""), opts);
        }

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

            if (a === undefined || b === undefined) {
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

        CC.remove(this);

    };

    var bindRemoveEvent = function() {

        el.bind("remove", function(){
            removed = true;
        });
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

    this.hideAllLayers = function() {
        for (var i in this.layers) {
            this.layers[i].hidden = true;
        }
    };

    this.toggleLayers = function(toHide, toShow, steps, easing) {

        if (!steps) {
            this.layers[toHide].hidden = true;
            this.layers[toShow].hidden = false;
            return null;
        } 

        var opt = {
            target: {},
            origin: this.layers[toHide],
            destination: this.layers[toShow],
            steps: steps,
            easing: easing
        }

        var anim = CC.layerAnimation(this, opt);

        anim.beforeStart(function() {
            opt.target = {};
            el.layers["CCTemp-"+toHide+"-"+toShow] = opt.target;
            opt.origin = el.layers[toHide];
            opt.origin.hidden = true;
            opt.destination = el.layers[toShow];
        }); 

        anim.then(function(){

            delete el.layers["CCTemp-"+toHide+"-"+toShow];
            el.layers[toShow].hidden = false;

        });

        return anim;
    };

    this.animateLayer = function(targetLayer, changes, steps, easing) {

        var opt = {
            target: {},
            origin: this.layers[targetLayer],
            destination: {},
            steps: steps,
            easing: easing
        };

        var anim = CC.layerAnimation(this, opt);

        anim.beforeStart(function() {
            opt.target = {};
            el.layers["CCTemp-"+targetLayer] = opt.target;
            opt.origin = el.layers[targetLayer];
            opt.origin.hidden = true;
            opt.destination = CC.merge({}, el.layers[targetLayer], changes);
        });

        anim.then(function(){

            delete el.layers["CCTemp-"+targetLayer];
            el.layers[targetLayer] = opt.destination;
            el.layers[targetLayer].hidden = false;

        });

        return anim;
    };

    this.getCreationTime = function() {
        return creationTime;
    };

    this.getCreationOrder = function() {
        return creationOrder;
    };

    init();

};