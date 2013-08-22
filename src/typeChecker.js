/***** TYPE CHECKER *****/

//have no dependency
//is dependency of objectTools, element

/**
* check if param is a function
*/
CC.isFunction = function(functionToCheck){
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

/**
* check if param is a string
*/
CC.isString = function(stringToCheck){
    return typeof stringToCheck == 'string' || stringToCheck instanceof String;
};

/**
* check if param is an array
*/
CC.isArray = function(arrayToCheck){
    return arrayToCheck && {}.toString.call(arrayToCheck) === '[object Array]';
};

/**
* check if param is an object
*/
CC.isObject = function(objectToCheck){
    return objectToCheck && objectToCheck.constructor == Object;
};