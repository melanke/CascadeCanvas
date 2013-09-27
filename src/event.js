/***** EVENT *****/

//have no dependency
//is dependency of element, loop, keyboard, mouse, promise

var eventEnvironmentBuilder = function(owner){

    var events = [];

    /**
    * register an action to a global event
    * @param eventsStr a string with the event name and optinally a namespace
    * the namespace is used to trigger, bind or unbind a section of the event
    * use this capability to narrow the scope of our unbinding actions,
    * example: 'eventName.namespace1'
    * @param action a function to be invoked when the event is triggered
    */
    owner.bind = function(eventsStr, action){

        var evtAndNamespace = eventsStr.split(".");
        var evtName = evtAndNamespace[0];
        var namespace = evtAndNamespace[1] || "root";

        if (!events[evtName]) {
            events[evtName] = {};
        }

        if (!events[evtName][namespace]) {
            events[evtName][namespace] = [];
        }

        if (action) {
            events[evtName][namespace].push(action);
        }

        return {
            unbind: function(){
                owner.unbind(eventsStr, action);
            }
        };

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
    owner.unbind = function(eventsStr, action){

        var evtAndNamespace = eventsStr.split(".");
        var evtName = evtAndNamespace[0];
        var namespace = evtAndNamespace[1] || "root";

        if (!events[evtName]) {
            return;
        }

        if (namespace) {
            if (eventName) {
                delete events[evtName][namespace];
            } else {
                //delete all events for this namespace
                for (var i in events) {
                    delete events[i][namespace];
                }

            }
        } else if (action) {

            for (var n in events[evtName]) {
                
                for (var i in events[evtName][n]) {
                    if (events[evtName][n][i] === action) {
                        events[evtName][n].splice(i, 1);
                    }
                }
                
            }
        } else {
            delete events[evtName];
        } 

    };

    /**
    * invoke all actions of a global event
    * @param eventsStr a string with the event name and optinally a namespace
    * the namespace is used to trigger, bind or unbind a section of the event
    * use this capability to narrow the scope of our unbinding actions,
    * example: 'eventName.namespace1'
    */
    owner.trigger = function(eventsStr){

        if (!running) {
            return;
        }

        var evtAndNamespace = eventsStr.split(".");
        var evtName = evtAndNamespace[0];
        var namespace = evtAndNamespace[1] || "root";

        var args = [].splice.call(arguments, 1); //all arguments except the first (eventsStr)

        var callNamespace = function(n){
            var e = events[evtName][n];

            for (var i in e) {
                e[i].apply(owner, args);
            }
        };

        if (events[evtName] && events[evtName][namespace]) {

            if (namespace != "root") {
                callNamespace(namespace);
            } else {
                
                for (var d in events[evtName]) {
                    callNamespace(d);
                }

            }
        }

    };

    owner.clearEvents = function(){
        events = [];
    };

};

eventEnvironmentBuilder(CC);