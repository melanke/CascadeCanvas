/***** OBJECT TOOLS *****/

//depends on typeChecker
//is dependency of element, elementlist

/**
* merge all attributes of the arguments recursively into the first argument and returns it
*/
CC.merge = function() {

    var mergeRecursively = function(merged, obj){

        if(!merged || !obj) {
            return;
        }

        for (var p in obj) {

            // Property in destination object set; update its value.
            if (CC.isObject(obj[p])) {

                if (!merged[p]) {
                    merged[p] = {};
                }

                mergeRecursively(merged[p], obj[p]);

            } else {

                merged[p] = obj[p];

            }

        }

    };

    for (var i = 1; i < arguments.length; i++) {

        mergeRecursively(arguments[0], arguments[i]);

    }

    return arguments[0];

};

/**
* sort the items of an array by property
* @param elements array to be sorted
* @param prop the property to compare
* @param invert if you want the reverse order
*/
CC.sort = function(elements, prop, invert){

    if (!CC.isArray(elements)) {
        var asArray = [];
        for (var e in elements) {
            asArray.push(elements[e]);
        }
        elements = asArray;
    }

    return elements.sort(function(a, b){
        if (a[prop] > b[prop]) {
            return invert ? -1 : 1;
        }

        if (a[prop] < b[prop]) {
            return invert ? 1 : -1;
        }

        if (a[prop] == undefined) {
            if (b[prop] < 0) {
                return invert ? -1 : 1;
            }

            if (b[prop] > 0) {
                return invert ? 1 : -1;
            }
        }

        if (b[prop] == undefined) {
            if (a[prop] < 0) {
                return invert ? 1 : -1;
            }

            if (a[prop] > 0) {
                return invert ? -1 : 1;
            }
        }

        return 0;
    });
};

/**
* rotate a point
* @param p the point to be rotated
* @param anchor the anchor point
* @param angle the angle of the rotation
*/
CC.rotatePoint = function(p, anchor, angle){

    var px = p.x;
    if (px == undefined) {
        px = p[0];
    }

    var py = p.y;
    if (py == undefined) {
        py = p[1];
    }

    var ax = anchor.x;
    if (ax == undefined) {
        ax = anchor[0];
    }

    var ay = anchor.y;
    if (ay == undefined) {
        ay = anchor[1];
    }

    var teta = angle * Math.PI / 180.0;
    var diffX = px - ax;
    var diffY = py - ay;
    var cos = Math.cos(teta);
    var sin = Math.sin(teta);

    return {
        x: Math.round(cos * diffX - sin * diffY + ax),
        y: Math.round(sin * diffX + cos * diffY + ay)
    };

};