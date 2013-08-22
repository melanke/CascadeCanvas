/***** LOOP *****/

//depends on event
//is not a internal dependency

var running = true;

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
        draw();
        CC.step++;
    }

    var animFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        null;

    if ( animFrame !== null ) {
        
        var recursiveAnim = function() {
            mainloop();
            animFrame(recursiveAnim);
        };

        // start the mainloop
        animFrame(recursiveAnim);

    } else {
        var ONE_FRAME_TIME = 1000.0 / 60.0 ;
        setInterval( mainloop, ONE_FRAME_TIME );
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


/**
* draw all elements
*/
var draw = function(){

    CC.context.clearRect(0, 0 , CC.screen.w, CC.screen.h);

    CC("*").sort("zIndex", true).each(function(){

        this.draw();

    });

};