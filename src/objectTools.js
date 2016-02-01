/***** OBJECT TOOLS *****/

(function(){

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

                    if (!merged[p] || !CC.isObject(merged[p])) {
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
    * sort the items of an array by properties and order
    */
    CC.sort = function(){

        if (arguments.length < 2)
        {
            return;
        }

        var elements = arguments[0];

        var props = [].splice.call(arguments, 1); //all arguments except the first (elements)

        if (!CC.isArray(elements)) {

            if (!CC.isObject(elements))
            {
                return elements;
            }

            var asArray = [];
            for (var e in elements) {
                asArray.push(elements[e]);
            }
            elements = asArray;
        }

        if (!CC.isArray(props[0]) || props[0].length < 2)
        {
            return elements;
        }

        var sortOrderChecker = function(a, b, index){
            var prop = props[index][0];
            var order = props[index][1];

            var aprop = a[prop];
            var bprop = b[prop];

            if (CC.isFunction(aprop)) {
                aprop = aprop.call(a);
            }

            if (CC.isFunction(bprop)) {
                bprop = bprop.call(b);
            }

            if (aprop == bprop) {
                var nextIndex = index +1;
                if (props.length > nextIndex && props[nextIndex].length > 1) {
                    return sortOrderChecker(a, b, nextIndex);
                } else {
                    return 0;
                }
            }

            if (aprop > bprop) {
                return order !== "ASC" ? -1 : 1;
            }

            if (aprop < bprop) {
                return order !== "ASC" ? 1 : -1;
            }

            if (aprop == undefined) {
                if (bprop < 0) {
                    return order !== "ASC" ? -1 : 1;
                }

                if (bprop > 0) {
                    return order !== "ASC" ? 1 : -1;
                }
            }

            if (bprop == undefined) {
                if (aprop < 0) {
                    return order !== "ASC" ? 1 : -1;
                }

                if (aprop > 0) {
                    return order !== "ASC" ? -1 : 1;
                }
            }

            return 0;
        };

        return elements.sort(function(a, b){
            return sortOrderChecker(a, b, 0);
        });
    };

})();