/***** RESOURCE *****/

//have no dependency
//is dependency of element

var sprites = {}; //sprites loaded stored by url

/**
* pre-load the image resources used in game
* @param srcs an array of strings with the path of file
* @param callback function called when all resources are loaded
*/
CC.loadResources = function(srcs, callback){
    
    var loadRecursively = function(index) {
        var img = new Image();
        img.src = srcs[index];
        img.onload = function(){

            sprites[srcs[index]] = this;

            if (index < srcs.length - 1) {
                loadRecursively(index+1);
            } else {
                callback();
            }

        };
    };

    loadRecursively(0);

};

CC.useResource = function(src){
    return sprites[src];
};