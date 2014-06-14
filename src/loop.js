/***** LOOP *****/

//depends on event and drawer
//is not a internal dependency

(function(){
    var running = false;
    var requestAnimId;
    var intervalAnimId;
    

    /**
    * start the routine of the gameloop, for each loop it triggers 'enterframe' event and render the elements
    */
    CC.startLoop = function(){

        running = true;

        CC.loadScreens();

        var mainloop = function(){

            CC.trigger("enterframe");
            CC.draw();
        };

        var animFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            null;

        if (animFrame !== null) {
            
            var recursiveAnim = function() {
                mainloop();
                requestAnimId = animFrame(recursiveAnim);
            };

            // start the mainloop
            requestAnimId = animFrame(recursiveAnim);

        } else {
            var ONE_FRAME_TIME = 1000.0 / 60.0 ;
            intervalAnimId = setInterval( mainloop, ONE_FRAME_TIME );
        }

    };

    /**
    * stop the gameloop
    */
    CC.stopLoop = function(){

        isRunning = false;

        if (requestAnimId) {
            var cancelFrame = window.cancelAnimationFrame ||
                window.webkitCancelAnimationFrame ||
                window.mozCancelAnimationFrame    ||
                window.oCancelAnimationFrame      ||
                window.msCancelAnimationFrame     ||
                null;

            if (cancelFrame !== null) {
                cancelFrame(requestAnimId);
                requestAnimId = null;
            }
        }

        if (intervalAnimId) {
            clearInterval(intervalAnimId);
            intervalAnimId = null;
        }
    };

    /**
    * check if loop is enabled. Important: "stopLoop" will not disable the loop, only "pause" will do it
    */
    CC.isRunning = function(){
        return running;
    };
    
})();