/***** RESOURCE *****/

//depends on promise
//is dependency of element

(function(){

    var sprites = {}; //sprites loaded stored by url

    /**
    * pre-load the image resources used in game
    * @param srcs an array of strings with the path of file
    * @param callback function called when all resources are loaded
    */
    CC.loadResources = function(srcs){
        
        var p = new CC.Promise();

        var loadRecursively = function(index) {
            var img = new Image();
            img.src = srcs[index];
            img.onload = function(){

                sprites[srcs[index]] = this;

                if (index < srcs.length - 1) {
                    loadRecursively(index+1);
                } else {
                    p.done();
                }

            };
        };

        loadRecursively(0);

        return p;

    };

    CC.useResource = function(src){
        return sprites[src];
    };

})();