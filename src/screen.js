/***** SCREEN *****/

//have no dependency
//is not a internal dependency

/**
* set the center position to focus the drawing
*/
CC.setScreenCenter = function(x, y) {
    CC.screen.x = (CC.screen.w / 2) - x;
    CC.screen.y = (CC.screen.h / 2) - y;
};