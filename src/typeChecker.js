/***** TYPE CHECKER *****/

(function(){

    /**
    * check if param is a function
    */
    CC.isFunction = function(functionToCheck){
        return functionToCheck != null && {}.toString.call(functionToCheck) === '[object Function]';
    }

    /**
    * check if param is a string
    */
    CC.isString = function(stringToCheck){
        return typeof stringToCheck == 'string' || stringToCheck instanceof String;
    };

    /**
    * check if param is a number
    */
    CC.isNumber = function(numberToCheck) {
    	return !isNaN(parseFloat(numberToCheck)) && isFinite(numberToCheck);
    };

    /**
    * check if param is an array
    */
    CC.isArray = function(arrayToCheck){
        return arrayToCheck != null && {}.toString.call(arrayToCheck) === '[object Array]';
    };

    /**
    * check if param is an object and not a function, string or array
    */
    CC.isObject = function(objectToCheck){
        return objectToCheck != null 
        && typeof objectToCheck === 'object' 
        && !CC.isFunction(objectToCheck) 
        && !CC.isString(objectToCheck)
        && !CC.isNumber(objectToCheck)
        && !CC.isArray(objectToCheck);
    };

})();