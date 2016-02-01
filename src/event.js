/***** EVENT *****/

/**
* builds an enviroment for event handling (internal use)
*/
var eventEnvironmentBuilder = function(owner, shouldTrigger){

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

        if (evtName && evtName.length) {

            if (!events[evtName]) {
                events[evtName] = {};
            }

            if (!events[evtName][namespace]) {
                events[evtName][namespace] = [];
            }

            if (action) {
                events[evtName][namespace].push(action);
            }
        }

        return {
            action: action,
            unbind: function(){
                var a = this.action;
                owner.unbind(eventsStr, a);
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

        if (evtName && evtName.length) {
            if (namespace != "root") {
                if (action) {
                    //evtName, namespace, action
                    if (events[evtName] && events[evtName][namespace]) {
                        for (var i in events[evtName][namespace]) {
                            if (events[evtName][namespace][i] === action) {
                                events[evtName][namespace].splice(i, 1);
                            }
                        }
                    }

                } else {
                    //evtName, namespace, no action
                    if (events[evtName]) {
                        delete events[evtName][namespace];
                    }
                }
            } else if (action) {
                //evtName, no namespace, action
                for (var i in events[evtName]) {
                    
                    for (var j in events[evtName][i]) {
                        if (events[evtName][i][j] === action) {
                            events[evtName][i].splice(j, 1);
                        }
                    }
                    
                }
            } else {
                //evtName, no namespace, no action
                delete events[evtName];
            }
        } else if (namespace != "root") {
            if (action) {
                //no evtName, namespace, action
                for (var i in events) {
                
                    for (var j in events[i][namespace]) {
                        if (events[i][namespace][j] === action) {
                            events[i][namespace].splice(j, 1);
                        }
                    }
                    
                }

            } else {
                //no evtName, namespace, no action
                for (var i in events) {
                    delete events[i][namespace];
                }
            }
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

        if (shouldTrigger && !shouldTrigger()) {
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

        if (events[evtName]) {

            if (namespace == "root") {
                for (var d in events[evtName]) {
                    callNamespace(d);
                }
            } else if (events[evtName] && events[evtName][namespace]) {
                callNamespace(namespace);
            }   
            
        }
        

    };

    /**
    * Removes all events, except the events registered by CascadeCanvas itself
    */
    owner.clearEvents = function(){
        for (var evName in events) {
            var hasCCEv = false;

            for (var namespace in events[evName]) {
                if (namespace !== "_cc_") {
                    delete events[evName][namespace];
                } else {
                    hasCCEv = true;
                }
            }

            if (!hasCCEv) {
                delete events[evName];
            }
        }
    };

};

eventEnvironmentBuilder(CC);