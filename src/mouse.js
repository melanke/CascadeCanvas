/***** MOUSE *****/

//depends on event
//no one depends on it

canvas.onclick = function(event){
    CC.trigger("click", event);
};

canvas.oncontextmenu = function (event) { 
    CC.trigger("rightclick", event);
    return false; 
};