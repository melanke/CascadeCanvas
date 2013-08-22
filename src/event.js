/***** EVENT *****/

//have no dependency
//is dependency of element, loop, keyboard, mouse

/**
* register an action to a global event
* @param eventsStr a string with the event name and optinally a namespace
* the namespace is used to trigger, bind or unbind a section of the event
* use this capability to narrow the scope of our unbinding actions,
* example: 'eventName.namespace1'
* @param action a function to be invoked when the event is triggered
*/
CC.bind = function(eventsStr, action){

    var evtAndNamespace = eventsStr.split(".");
    var evtName = evtAndNamespace[0];
    var namespace = evtAndNamespace[1] || "root";

    if (!events[evtName]) {
        events[evtName] = {};
    }

    if (!events[evtName][namespace]) {
        events[evtName][namespace] = [];
    }

    events[evtName][namespace].push(action);

};

/**
* remove an action to a global event
* @param eventsStr a string with the event name and optinally a namespace
* the namespace is used to trigger, bind or unbind a section of the event
* use this capability to narrow the scope of our unbinding actions,
* example: 'eventName.namespace1'
* @param action (optional) if you dont specify the domain you can specify
* the action you want to remove
*/
CC.unbind = function(eventsStr, action){

    var evtAndDomain = eventsStr.split(".");
    var evt = evtAndDomain[0];
    var domain = evtAndDomain[1] || "root";

    if (!events[evt]) {
        return;
    }

    if (domain) {
        delete events[evt][domain];
    } else if (action) {
        for (var d in events[evt]) {
            for (var i in events[evt][d]) {
                if (events[evt][d][i] === action) {
                    events[evt][d].splice(i, 1);
                }
            }
        }
    } else {
        delete events[evt];
    }

};

/**
* invoke all actions of a global event
* @param eventsStr a string with the event name and optinally a namespace
* the namespace is used to trigger, bind or unbind a section of the event
* use this capability to narrow the scope of our unbinding actions,
* example: 'eventName.namespace1'
*/
CC.trigger = function(eventsStr){

    if (!running) {
        return;
    }

    var evtAndDomain = eventsStr.split(".");
    var evt = evtAndDomain[0];
    var domain = evtAndDomain[1] || "root";
    var args = [].splice.call(arguments, 1); //all arguments except the first (eventsStr)

    var callDomain = function(d){
        for (var i in events[evt][d]) {
            events[evt][domain][i].apply(this, args);
        }
    };

    if (events[evt] && events[evt][domain]) {

        if (domain != "root") {
            callDomain(domain);
        } else {
            
            for (var d in events[evt]) {
                callDomain(d);
            }

        }
    }

};