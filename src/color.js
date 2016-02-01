/***** PROMISE *****/

(function(){

    CC.Color = function(arg) {

        var self = this;
        
        var init = function() {

            if (CC.isString(arg)) {
                self.str = arg;
                self.rgba = strToColor(self.str);
                self.cmyka = rgbaToCmyka(self.rgba);
            } else if (CC.isArray(arg) && arg.length <= 5) {

                if (arg.length == 3) {
                    self.rgba = [arg[0], arg[1], arg[2], 1];
                    self.cmyka = rgbaToCmyka(self.rgba);
                } else if (arg.length == 4) {
                    self.rgba = [arg[0], arg[1], arg[2], arg[3]];
                    self.cmyka = rgbaToCmyka(self.rgba);
                } else {
                    self.cmyka = [arg[0], arg[1], arg[2], arg[3], arg[4]];
                    self.rgba = cmykaToRgba(self.cmyka);
                }

                self.str = rgbaToStr(self.rgba);
            }
            else
            {
                self.valid = false;
                return;
            }

            self.valid = true;
            self.R = self.rgba[0];
            self.G = self.rgba[1];
            self.B = self.rgba[2];
            self.A = self.rgba[3];
            self.C = self.cmyka[0];
            self.M = self.cmyka[1];
            self.Y = self.cmyka[2];
            self.K = self.cmyka[3];
        };

        var strToColor = function(str) {
            var rgbaRegex = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/;

            if (str.indexOf("rgb") > -1) {
                //if str contains 'rgb' or 'rgba' we will parse it
                //it is faster than using the other methods and canvas method can't find alpha correctly

                var values = rgbaRegex.exec(str);

                return [
                    Math.round(parseFloat(values[1])), 
                    Math.round(parseFloat(values[2])), 
                    Math.round(parseFloat(values[3])), 
                    Math.round(parseFloat(values[4] || "1"))
                ];

            } else if (CC.screens[0] && CC.screens[0].context) {
                //if we have a canvas context we will use it to find our color

                var ctx = CC.screens[0].context;
                ctx.fillStyle = str;
                ctx.fillRect(0, 0, 1, 1);
                var rgba = ctx.getImageData(0, 0, 1, 1).data;
                return [rgba[0], rgba[1], rgba[2], rgba[3]/255];
            } else {
                //if we don't have a canvas context yet, we will create a html tag to find the color

                var tempDiv = document.createElement("div");
                tempDiv.style.color = str;
                document.body.appendChild(tempDiv);
                var rgbStr = getComputedStyle(tempDiv).color;
                document.body.removeChild(tempDiv);
                
                var values = rgbaRegex.exec(rgbStr);

                return [
                    Math.round(parseFloat(values[1])), 
                    Math.round(parseFloat(values[2])), 
                    Math.round(parseFloat(values[3])), 
                    1
                ];
            }

        };

        var rgbaToCmyka = function(rgba) {
            if (rgba[0] === 0 && rgba[1] === 0 && rgba[2] === 0)
            {
                return [0, 0, 0, 1, 1];
            }
            else
            {
                var c = 1 - (rgba[0] / 255),
                    m = 1 - (rgba[1] / 255),
                    y = 1 - (rgba[2] / 255),
                    k = Math.min(c, m, y);

                
                c = ((c - k) / (1 - k));
                m = ((m - k) / (1 - k));
                y = ((y  - k) / (1 - k));

                return [c, m, y, k, rgba[3]];
            }
        };

        var cmykaToRgba = function(cmyka) {
            var R = cmyka[0] * (1.0 - cmyka[3]) + cmyka[3], 
                G = cmyka[1] * (1.0 - cmyka[3]) + cmyka[3],
                B = cmyka[2] * (1.0 - cmyka[3]) + cmyka[3];

            R = Math.round((1.0 - R) * 255.0 + 0.5);
            G = Math.round((1.0 - G) * 255.0 + 0.5);
            B = Math.round((1.0 - B) * 255.0 + 0.5);

            return [R, G, B, cmyka[4]];
        };

        var rgbaToStr = function(rgba) {
            return "rgba("+rgba[0]+", "+rgba[1]+", "+rgba[2]+", "+rgba[3]+")";
        };

        this.mixWith = function(other, pct) {
            if (!CC.isNumber(pct)) {
                pct = 50;
            }
            var dif = 100 - pct;

            return new CC.Color([
                (this.C*dif + other.C*pct) / 100,
                (this.M*dif + other.M*pct) / 100,
                (this.Y*dif + other.Y*pct) / 100,
                (this.K*dif + other.K*pct) / 100,
                (this.A*dif + other.A*pct) / 100
            ]);
        };

        init();
    };

})();