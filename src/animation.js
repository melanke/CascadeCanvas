/***** ANIMATION *****/

(function(){

	/**
	* Constructor( Function[] loopers, Number totalsteps [, String easing] [, Object params])
	* Constructs an animation with a single or multiple fixed length loopers to start at the same time; 
	* the number of steps this animation will take; easing effect and params to be passed to the loopers
	*
	* Constructor( Function[] loopers [, Object params])
	* Constructs an animation with a single or multiple autostop loopers to start at the same time and
	* params to be passed to the loopers
	*
	* https://github.com/CascadeCanvas/CascadeCanvas/wiki/CC.Animation
	*/
	CC.Animation = function() {

		var self = this;

		var args = [].splice.call(arguments, 0), //copy
			loopers = args[0],
			totalsteps = args[1],
			effect = args[2],
			params = args[args.length-1],
			currentStep = 0,
			finishedLoopers = 0,
			pct = 0,
			enderframe = undefined,
			callbacks = [],
			beforeStart = [];

		if (!CC.isArray(loopers)) {
			loopers = [loopers];
		}

		if (!CC.isNumber(totalsteps)) {
			totalsteps = undefined;
		}

		if (!CC.isString(effect)) {
			effect = undefined;
		}

		if (!CC.isObject(params)) {
			params = undefined;
		}

		this.isPlaying = false;

		/**
		* void then( Function callback )
		* Register callbacks, functions to be called when the animation completes
		* https://github.com/CascadeCanvas/CascadeCanvas/wiki/animation.then
		*/
		this.then = function(cb) {
			callbacks.push(cb);
		};

		/**
		* void beforeStart( Function callback )
		* Register a function to be called when the animation is about to start
		* https://github.com/CascadeCanvas/CascadeCanvas/wiki/animation.beforeStart
		*/
		this.beforeStart = function(bf) {
			beforeStart.push(bf);
		};

		/**
		* void removeCallback( Function callback )
		* Removes a callback registered with animation.then or animation.beforeStart
		* https://github.com/CascadeCanvas/CascadeCanvas/wiki/animation.removeCallback
		*/
		this.removeCallback = function(cb) {
			for (var i in callbacks){
				if (cb === callbacks[i]) {
					callbacks[i] = null;
				}
			}

			for (var i in beforeStart){
				if (cb === beforeStart[i]) {
					beforeStart[i] = null;
				}
			}
		};

		/**
		* void done()
		* Completes the animation
		* https://github.com/CascadeCanvas/CascadeCanvas/wiki/animation.done
		*/
		this.done = function() {
			this.pause();
			currentStep = 0;
			finishedLoopers = 0;
			pct = 0;

			for (var i in callbacks) {
				var resp = null;
				var cb = callbacks[i];
				
				if (cb) { 
					resp = cb();
				}

				if (resp && CC.isFunction(resp.start) && resp.isPlaying === false) {
					resp.start();
				}
			}
		};

		/**
		* void resume()
		* Starts or resume the paused animation
		* https://github.com/CascadeCanvas/CascadeCanvas/wiki/animation.resume
		*/
		this.resume = function() {
			if (this.isPlaying) {
				return;
			}

			this.isPlaying = true;

			enterframe = CC.bind("enterframe", function(){
				var keepGoing = undefined;

				if (currentStep === 0) {
					callBeforeStart();
				}

				if (totalsteps !== undefined) {
					pct = CC.easing.linear(currentStep, 0, 100, totalsteps);
					var showPct = pct;

					if (CC.isFunction(CC.easing[effect])) {
						showPct = CC.easing[effect](currentStep, 0, 100, totalsteps);
					}

					if (pct < 100) {
						for (var i in loopers) {
							keepGoing = loopers[i].apply(CC, [showPct, params]);
						}
					}
				} else {
					for (var i in loopers) {
						keepGoing = loopers[i].apply(CC, [currentStep, params]);
					}
				}

				if (keepGoing === false) {
					finishedLoopers++;
				}

				currentStep++;

				if (pct >= 100 || finishedLoopers >= loopers.length) {
					self.done();
				}
			});
		};

		/**
		* void pause()
		* Pauses the animation
		* https://github.com/CascadeCanvas/CascadeCanvas/wiki/animation.pause
		*/
		this.pause = function() {
			if (!this.isPlaying) {
				return;
			}

			this.isPlaying = false;
			if (enterframe) {
				enterframe.unbind();
			}
		};

		/** 
		* void togglePause()
		* If the animation is paused it resumes it, if the animation is playing it pauses it
		* https://github.com/CascadeCanvas/CascadeCanvas/wiki/animation.togglePause
		*/
		this.togglePause = function() {
			if (this.isPlaying) {
				this.pause();
			} else {
				this.resume();
			}
		};

		/**
		* Starts the animation from the beginning
		* void start()
		* https://github.com/CascadeCanvas/CascadeCanvas/wiki/animation.start
		*/
		this.start = function() {
			currentStep = 0;
			this.resume();
		};

		var callBeforeStart = function() {
			for (var i in beforeStart) {
				beforeStart[i]();
			}
		};

		/**
		* void loop()
		* Makes the animation start from beginning and loop itself forever until pause is called
		* https://github.com/CascadeCanvas/CascadeCanvas/wiki/animation.loop
		*/
		this.loop = function() {
			this.then(function(){
				self.start();
			});

			this.start();
		};

	};

	/**
	* CC.Animation CC.animationChain( CC.Animation[] animations )
	* let you create an animation that runs a sequence of animations, including delay
	* https://github.com/CascadeCanvas/CascadeCanvas/wiki/CC.animationChain
	*/
	CC.animationChain = function(animations) {
        
        if (animations.length === 0) {
            return null;
        }
        
        var totalAn = new CC.Animation();

        var currentPlaying = 0;

        for (var i in animations) {

	        if (CC.isNumber(animations[i])) {
	        	//a delay
	        	animations[i] = new CC.Animation(function(){}, animations[i]);
	        }

	        (function(){
		        var index = parseInt(i);

		        animations[i].then(function(){
		        	if (animations.length > index+1) {
		        		currentPlaying = index+1;
		        		animations[currentPlaying].start();
		        	} else {
		        		totalAn.done();
		        	}
		        });
		    })();
        }

        totalAn.start = function(){
        	currentPlaying = 0;
        	this.isPlaying = true;
        	animations[currentPlaying].start();
        };

        totalAn.resume = function(){
        	this.isPlaying = true;
        	animations[currentPlaying].resume();
        };

        totalAn.pause = function() {
        	this.isPlaying = false;
        	animations[currentPlaying].pause();
        };

        return totalAn;
    };

    /**
    * CC.Animation CC.layerAnimation( Element element, Object option )
    * let you transform one layer to another making use of tween technic
    * https://github.com/CascadeCanvas/CascadeCanvas/wiki/CC.layerAnimation
    */
	CC.layerAnimation = function(element, opt){

		var animation = new CC.Animation(function(pct){
			CC.transformLayer(element, opt, pct);
		}, opt.steps, opt.effect);

		animation.beforeStart(function(){

			if (opt.target.zIndex !== opt.destination.zIndex) {
				if (opt.target.zIndex === undefined) {
					opt.target.zIndex = 0;
				}

				if (opt.destination.zIndex === undefined) {
					opt.destination.zIndex = 0;
				}
			}
		});

		return animation;

	};

	CC.easing = {
		linear: function (t, b, c, d) {
			return c*t/d + b;
		},
		easeInQuad: function (t, b, c, d) {
			return c*(t/=d)*t + b;
		},
		easeOutQuad: function (t, b, c, d) {
			return -c *(t/=d)*(t-2) + b;
		},
		easeInOutQuad: function (t, b, c, d) {
			if ((t/=d/2) < 1) return c/2*t*t + b;
			return -c/2 * ((--t)*(t-2) - 1) + b;
		},
		easeInCubic: function (t, b, c, d) {
			return c*(t/=d)*t*t + b;
		},
		easeOutCubic: function (t, b, c, d) {
			return c*((t=t/d-1)*t*t + 1) + b;
		},
		easeInOutCubic: function (t, b, c, d) {
			if ((t/=d/2) < 1) return c/2*t*t*t + b;
			return c/2*((t-=2)*t*t + 2) + b;
		},
		easeInQuart: function (t, b, c, d) {
			return c*(t/=d)*t*t*t + b;
		},
		easeOutQuart: function (t, b, c, d) {
			return -c * ((t=t/d-1)*t*t*t - 1) + b;
		},
		easeInOutQuart: function (t, b, c, d) {
			if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
			return -c/2 * ((t-=2)*t*t*t - 2) + b;
		},
		easeInQuint: function (t, b, c, d) {
			return c*(t/=d)*t*t*t*t + b;
		},
		easeOutQuint: function (t, b, c, d) {
			return c*((t=t/d-1)*t*t*t*t + 1) + b;
		},
		easeInOutQuint: function (t, b, c, d) {
			if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
			return c/2*((t-=2)*t*t*t*t + 2) + b;
		},
		easeInSine: function (t, b, c, d) {
			return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
		},
		easeOutSine: function (t, b, c, d) {
			return c * Math.sin(t/d * (Math.PI/2)) + b;
		},
		easeInOutSine: function (t, b, c, d) {
			return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
		},
		easeInExpo: function (t, b, c, d) {
			return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
		},
		easeOutExpo: function (t, b, c, d) {
			return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
		},
		easeInOutExpo: function (t, b, c, d) {
			if (t==0) return b;
			if (t==d) return b+c;
			if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
			return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
		},
		easeInCirc: function (t, b, c, d) {
			return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
		},
		easeOutCirc: function (t, b, c, d) {
			return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
		},
		easeInOutCirc: function (t, b, c, d) {
			if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
			return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
		},
		easeInElastic: function (t, b, c, d) {
			var s=1.70158;var p=0;var a=c;
			if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
			if (a < Math.abs(c)) { a=c; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (c/a);
			return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		},
		easeOutElastic: function (t, b, c, d) {
			var s=1.70158;var p=0;var a=c;
			if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
			if (a < Math.abs(c)) { a=c; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (c/a);
			return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
		},
		easeInOutElastic: function (t, b, c, d) {
			var s=1.70158;var p=0;var a=c;
			if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
			if (a < Math.abs(c)) { a=c; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (c/a);
			if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
			return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
		},
		easeInBack: function (t, b, c, d, s) {
			if (s == undefined) s = 1.70158;
			return c*(t/=d)*t*((s+1)*t - s) + b;
		},
		easeOutBack: function (t, b, c, d, s) {
			if (s == undefined) s = 1.70158;
			return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
		},
		easeInOutBack: function (t, b, c, d, s) {
			if (s == undefined) s = 1.70158; 
			if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
			return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
		},
		easeInBounce: function (t, b, c, d) {
			return c - CC.easing.easeOutBounce (d-t, 0, c, d) + b;
		},
		easeOutBounce: function (t, b, c, d) {
			if ((t/=d) < (1/2.75)) {
				return c*(7.5625*t*t) + b;
			} else if (t < (2/2.75)) {
				return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
			} else if (t < (2.5/2.75)) {
				return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
			} else {
				return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
			}
		},
		easeInOutBounce: function (t, b, c, d) {
			if (t < d/2) return CC.easing.easeInBounce (t*2, 0, c, d) * .5 + b;
			return CC.easing.easeOutBounce (t*2-d, 0, c, d) * .5 + c*.5 + b;
		}
	};

})();