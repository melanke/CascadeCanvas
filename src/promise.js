/***** PROMISE *****/

(function(){

    CC.Promise = function() {
        this._callbacks = [];
    };

    CC.Promise.prototype.then = function(func, context) {
        
        var p;

        if (this._isdone) {
            p = func.apply(context, this.result);
        } else {

            p = new CC.Promise();

            this._callbacks.push(function () {
                
                var res = func.apply(context, arguments);
                
                if (res && CC.isFunction(res.then)) {
                    res.then(p.done, p);
                }
                
            });
        }

        return p;
    };

    CC.Promise.prototype.done = function() {
        
        this.result = arguments;
        this._isdone = true;

        for (var i = 0; i < this._callbacks.length; i++) {
            this._callbacks[i].apply(null, arguments);
        }

        this._callbacks = [];
    };

    CC.when = function(eventsStr){

        var p = new CC.Promise();

        var cb = function(){
            p.done.apply(p, arguments);
            CC.unbind(eventsStr, cb);
        };

        CC.bind(eventsStr, cb);

        return p;

    };

    CC.promiseJoin = function(promises) {

        var p = new CC.Promise();
        var total = promises.length;
        var numdone = 0;
        var results = [];

        var notifier = function(i) {
            return function() {
                numdone += 1;
                results[i] = Array.prototype.slice.call(arguments);
                
                if (numdone === total) {
                    p.done.apply(p, results);
                }
            };
        }

        for (var i = 0; i < total; i++) {
            promises[i].then(notifier(i));
        }

        return p;
    };

    CC.promiseChain = function(funcs, args) {
        
        var p = new CC.Promise();
        
        if (funcs.length === 0) {
            p.done.apply(p, args);
        } else {

            var pi = funcs[0].apply(null, args);

            if (pi && CC.isFunction(pi.then)) {

                pi.then(function() {
                    
                    funcs.splice(0, 1);
                    
                    CC.promiseChain(funcs, arguments).then(function() {
                        p.done.apply(p, arguments);
                    });
                });

            }
        }
        return p;
    };

})();
