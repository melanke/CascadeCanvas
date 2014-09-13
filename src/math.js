/***** MATH *****/

//doesnt have any dependency
//is dependency of mouse

(function(){

    /**
    * normalize the point, if it is an array transform it in an object
    */
    CC.normalizePoint = function(p) {
        var result = {
            x: p.x,
            y: p.y
        };

        if (result.x == undefined && p.length > 1)
        {
            result.x = p[0];
        }

        if (result.y == undefined && p.length > 1)
        {
            result.y = p[1];
        }

        return result;
    };

    /**
    * rotate a point
    * @param p the point to be rotated
    * @param anchor the anchor point
    * @param angle the angle of the rotation
    */
    CC.rotatePoint = function(p, anchor, angle){

        p = CC.normalizePoint(p);
        anchor = CC.normalizePoint(anchor);

        var teta = angle * Math.PI / -180.0;
        var diffX = p.x - anchor.x;
        var diffY = p.y - anchor.y;
        var cos = Math.cos(teta);
        var sin = Math.sin(teta);

        return {
            x: Math.round(cos * diffX - sin * diffY + anchor.x),
            y: Math.round(sin * diffX + cos * diffY + anchor.y)
        };

    };


    
    /** 
    * calculates the distance between two points
    */
    
    CC.calcDistance = function(p1, p2) {

        p1 = CC.normalizePoint(p1);
        p2 = CC.normalizePoint(p2);

        var xs = 0;
        var ys = 0;

        xs = p2.x - p1.x;
        xs = xs * xs;

        ys = p2.y - p1.y;
        ys = ys * ys;

        return Math.sqrt(xs + ys);

    };

    /**
    * calculates the angle in a line of two points in radians
    */
    CC.calcAngleRadians = function(p1, p2) {

        p1 = CC.normalizePoint(p1);
        p2 = CC.normalizePoint(p2);

        return Math.atan2(p2.y - p1.y, p2.x - p1.x);

    };

    /**
    * calculates the angle in a line of two points in radians
    */
    CC.calcAngleDegrees = function(p1, p2) {

        return CC.calcAngleRadians(p1, p2) * -180 / Math.PI;

    };

    CC.generalFormEqOfLine = function (p1, p2){
        var p1 = CC.normalizePoint(p1);
        var p2 = CC.normalizePoint(p2);

        return {
            a: p1.y - p2.y,
            b: p2.x - p1.x,
            c: (p1.x - p2.x) * p1.y + (p2.y - p1.y) * p1.x
        };
    };

    CC.calcLineDistance = function(line, p) {
        p = CC.normalizePoint(p);

        return Math.abs(line.a * p.x + line.b * p.y + line.c) / Math.sqrt(line.a * line.a + line.b * line.b);
    };

    CC.calcCenterOfPoints = function(points) {

        var minX = Number.MAX_VALUE;
        var minY = Number.MAX_VALUE;
        var maxX = Number.MIN_VALUE;
        var maxY = Number.MIN_VALUE;

        for (var i in points) {
            var p = CC.normalizePoint(points[i]);

            minX = Math.min(minX, p.x);
            minY = Math.min(minY, p.y);
            maxX = Math.max(maxX, p.x);
            maxY = Math.max(maxY, p.y);
        }

        return {
            x: minX + ((maxX - minX) / 2),
            y: minY + ((maxY - minY) / 2)
        }

    };

})();