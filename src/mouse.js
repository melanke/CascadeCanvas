/***** MOUSE *****/



var mouseEnvironmentBuilder = function(canvas, screen) {

    canvas.onselectstart = function() { 
    	return false; 
    };

    canvas.onclick = function(event){ 
    	event.screen = screen;
        CC.trigger("click", event);
    };

    canvas.oncontextmenu = function (event) { 
    	event.screen = screen;
        CC.trigger("rightclick", event); 
        return false; 
    };

    var findFirstClickableElementInArea = function(x, y) {

    	var result = null;

    	CC("*").sort(["zIndex", "ASC"], ["getCreationOrder", "DESC"]).each(function(){

	        if (this.clickable === true
	         && x >= this.x 
             && x <= this.x + this.w
             && y >= this.y
             && y <= this.y + this.h) {
                result = this;
                return false;
            }

	    });

	    return result;

    };

    CC.bind("click", function(event){

    	if (!event.screen || event.screen.htmlId != screen.htmlId)
    	{
    		return;
    	}

        var clicked = findFirstClickableElementInArea(event.offsetX, event.offsetY);

        if (clicked && clicked.trigger)
        {
        	clicked.trigger("click", event);
        }
    });

};