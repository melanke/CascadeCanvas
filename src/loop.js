/***** LOOP *****/

//depends on event and drawer
//is not a internal dependency

var running = true;
var requestAnimId;
var intervalAnimId;

/**
* start the routine of the gameloop, for each loop it triggers 'enterframe' event and render the elements
*/
CC.startLoop = function(){

    var mainloop = function(){   

        if (!running) {
            return;
        }

        CC.screen.w = canvas.offsetWidth;
        CC.screen.h = canvas.offsetHeight;

        CC.trigger("enterframe");
        CC.drawer.draw();
        CC.step++;
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
* make the triggers and the gameloop to be ignored
*/
CC.pause = function(){
    running = false;
};


/**
* make the triggers and the gameloop to be considered again
*/
CC.play = function(){
    running = true;
};