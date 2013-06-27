"use strict";
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        
        define(["lib/cc.js", "lib/box2dweb.js"], factory);

    } else {
        
        window.b2 = factory(CC, Box2D);

    }
}(function (CC, Box2D) {

    var b2 = Box2D;

    CC.merge(b2, {

        Vec2 : b2.Common.Math.b2Vec2,
        BodyDef : b2.Dynamics.b2BodyDef,
        FixtureDef : b2.Dynamics.b2FixtureDef,
        Fixture : b2.Dynamics.b2Fixture,
        MassData : b2.Collision.Shapes.b2MassData,
        PolygonShape : b2.Collision.Shapes.b2PolygonShape,
        CircleShape : b2.Collision.Shapes.b2CircleShape,
        Body: b2.Dynamics.b2Body,

        scale: 30
    });

    var world = new b2.Dynamics.b2World(new b2.Vec2(0, 50), true);


    var debugCanvas = document.getElementById("b2Debug");
    var debugContext;
    if (debugCanvas) {
        debugContext = debugCanvas.getContext("2d");
    }

    if (debugContext) {
        var debugDraw = new b2.Dynamics.b2DebugDraw();
        debugDraw.SetSprite(debugContext);
        debugDraw.SetDrawScale(b2.scale);
        debugDraw.SetFillAlpha(0.5);
        debugDraw.SetFlags(b2.Dynamics.b2DebugDraw.e_shapeBit | b2.Dynamics.b2DebugDraw.e_jointBit);
        world.SetDebugDraw(debugDraw);
    }

    CC.bind("enterframe", function(){
        world.Step(1/60, 10, 10);
        world.ClearForces();

        if (debugContext) {
            world.DrawDebugData();
        }
    });

    CC.def("b2Body", function(opts){

        var el = this;

        var init = function(){
            if (!opts) {
                opts = {};
            }

            el.bodyDef = new b2.BodyDef(),
            el.fixDef = new b2.FixtureDef();


            CC.merge(el.bodyDef, {
                type: b2.Body.b2_dynamicBody,
                position: {
                    x: (el.x + (el.w/2)) / b2.scale, //position of Box2D is at center
                    y: (el.y + (el.h/2)) / b2.scale
                }
            }, opts.bodyDef);


            CC.merge(el.fixDef, {
                density: 1.0,
                friction: 0.5,
                restitution: 0.5
            }, opts.fixDef);

        };

        this.getWorld = function(){
            return world;
        };

        this.applyForce = function(x, y){
            this.body.ApplyForce(new b2.Vec2(x, y), this.body.GetWorldCenter());

            return this;
        };

        this.applyForceWithAngle = function(x, y){
            var p = CC.rotatePoint([x, y], this.body.GetWorldCenter(), this.angle);
            this.applyForce(p.x, p.y);
        };

        this.bind("remove", function(){
            world.DestroyBody(this.body);
        });

        init();

    });

    CC.def("b2Box", function(opts){

        var el = this;

        var init = function(){

            el.inherit("b2Body", opts);

            el.fixDef.shape = new b2.PolygonShape();

            el.fixDef.shape.SetAsBox(el.w / 2 / b2.scale, el.h / 2 / b2.scale);
            
            el.body = el.getWorld().CreateBody(el.bodyDef);
            el.fixture = el.body.CreateFixture(el.fixDef);

        };

        CC.bind("enterframe", function(){
            el.x = (el.body.GetPosition().x * b2.scale) - (el.w/2); //position of Box2D is at center
            el.y = (el.body.GetPosition().y * b2.scale) - (el.h/2);
            el.angle = el.body.GetAngle() / Math.PI * 180.0;
        });

        init();

    });

    CC.def("b2Circle", function(opts){

        var el = this;

        var init = function(){

            el.inherit("b2Body", opts);

            var radius = el.w / 2;

            el.fixDef.shape = new b2.CircleShape(radius / b2.scale);
            
            el.body = world.CreateBody(el.bodyDef);
            el.fixture = el.body.CreateFixture(el.fixDef);
        };

        CC.bind("enterframe", function(){
            el.x = (el.body.GetPosition().x * b2.scale) - (el.w/2); //position of Box2D is at center
            el.y = (el.body.GetPosition().y * b2.scale) - (el.h/2);
            el.angle = el.body.GetAngle() / Math.PI * 180.0;
        });

        init();

    });

    CC.def("b2Polygon", function(opts){

        var el = this;

        var init = function(){

            el.inherit("b2Body", opts);

            var shapeArray = [];

            for (var i in opts.polygon) {
                var p = opts.polygon[i];
                var x = p[0];
                var y = p[1];
                shapeArray.push(new b2.Vec2(x / b2.scale, y / b2.scale));
            }

            el.bodyDef.position.Set(el.x / b2.scale, el.y / b2.scale);          

            el.body = el.getWorld().CreateBody(el.bodyDef);




            if (PolygonUtils.clockWise(shapeArray) === PolygonUtils.CLOCKWISE) {
                shapeArray.reverse();
            }

            if (PolygonUtils.convex(shapeArray) === PolygonUtils.CONCAVE) {
                var tmp = PolygonUtils.process(shapeArray);
                for (i = 0; i < tmp.length; i = i + 3) {
                    var boxShape = new b2.PolygonShape();
                    boxShape.SetAsArray(new Array(tmp[i], tmp[i + 1], tmp[i + 2]));
                    var fixDef = new b2.FixtureDef();
                    fixDef.density = el.fixDef.density;
                    fixDef.restitution = el.fixDef.restitution;
                    fixDef.friction = el.fixDef.friction;
                    fixDef.shape = boxShape;

                    el.body.CreateFixture(fixDef);
                }

                el.fixDef = null;
                el.fixture = null;
            } else {

                el.fixDef.shape.SetAsArray(shapeArray);
                el.fixture = el.body.CreateFixture(el.fixDef);
            }




            el.anchor = {x: 0, y: 0};
        };

        CC.bind("enterframe", function(){
            el.x = el.body.GetPosition().x * b2.scale;
            el.y = el.body.GetPosition().y * b2.scale;
            el.angle = el.body.GetAngle() / Math.PI * 180.0;
        });

        init();

    });


    

    
    var PolygonUtils = (function(){
        /**
         * Functions to determine whether or not a polygon (2D) has its vertices ordered
         * clockwise or counterclockwise and also for testing whether a polygon is convex 
         * or concave
         * 
         * This code is a very quick port of the C functions written by Paul Bourke 
         * found here - http://debian.fmi.uni-sofia.bg/~sergei/cgsr/docs/clockwise.htm
         * 
         * ported to actionscript by @yadurajiv
         * http://chronosign.com/rant
         */

        var CLOCKWISE = 1,
            COUNTERCLOCKWISE = -1,
            CONCAVE = -1,
            CONVEX = 1;

        /*
          Return the clockwise status of a curve, clockwise or counterclockwise
          n vertices making up curve p
          return 0 for incomputables eg: colinear points
            CLOCKWISE == 1
            COUNTERCLOCKWISE == -1
          It is assumed that
          - the polygon is closed
          - the last point is not repeated.
          - the polygon is simple (does not intersect itself or have holes)
        */

        var clockWise = function(p) {
          var i, j, k, z,
              count = 0,
              n = p.length;

          if (n < 3) {
            return (0);
          }

          for (i = 0; i < n; i++) {
            j = (i + 1) % n;
            k = (i + 2) % n;
            z  = (p[j].x - p[i].x) * (p[k].y - p[j].y);
            z -= (p[j].y - p[i].y) * (p[k].x - p[j].x);

            if (z < 0) {
              count--;
            } else if (z > 0) {
              count++;
            }
          }

          if (count > 0) {
            return (COUNTERCLOCKWISE);
          } else if (count < 0) {
            return (CLOCKWISE);
          } else {
            return (0);
          }
        }

        var convex = function(p) {
          var i, j, k, z,
              flag = 0,
              n = p.length;

          if (n < 3) {
            return (0);
          }

          for (i = 0; i < n; i++) {
            j = (i + 1) % n;
            k = (i + 2) % n;
            z  = (p[j].x - p[i].x) * (p[k].y - p[j].y);
            z -= (p[j].y - p[i].y) * (p[k].x - p[j].x);

            if (z < 0) {
              flag |= 1;
            } else if (z > 0) {
              flag |= 2;
            }

            if (flag === 3) {
              return (CONCAVE);
            }
          }

          if (flag !== 0) {
            return (CONVEX);
          } else {
            return (0);
          }
        }




        /**
        This code is a quick port of code written in C++ which was submitted to 
        flipcode.com by John W. Ratcliff  // July 22, 2000 
        See original code and more information here:
        http://www.flipcode.com/archives/Efficient_Polygon_Triangulation.shtml

        ported to actionscript by Zevan Rosser
        www.actionsnippet.com
        */

        var EPSILON = 0.0000000001;

        var process = function(contour) {
          var result = [],
              n = contour.length,
              verts = [],
              v,
              nv = n,
              m,
              count = 2 * nv;  /* error detection */

          if (n < 3) {
            return null;
          }

          /* we want a counter-clockwise polygon in verts */

          if (0.0 < area(contour)) {
            for (v = 0; v < n; v++) {
              verts[v] = v;
            }
          } else {
            for (v = 0; v < n; v++) {
              verts[v] = (n - 1) - v;
            }
          }

          /*  remove nv-2 vertsertices, creating 1 triangle every time */
          for (m = 0, v = nv - 1; nv > 2;) {
            /* if we loop, it is probably a non-simple polygon */
            if (0 >= (count--)) {
              //** Triangulate: ERROR - probable bad polygon!
              // console.log("bad poly");
              return null;
            }

            /* three consecutive vertices in current polygon, <u,v,w> */
            var u = v;
            if (nv <= u) {
              u = 0; /* previous */
            }

            v = u + 1;
            if (nv <= v) {
              v = 0; /* new v */
            }

            var w = v + 1;
            if (nv <= w) {
              w = 0; /* next */
            }

            if (snip(contour, u, v, w, nv, verts)) {
              var a, b, c, s, t;

              /* true names of the vertices */
              a = verts[u];
              b = verts[v];
              c = verts[w];

              /* output Triangle */
              result.push(contour[a]);
              result.push(contour[b]);
              result.push(contour[c]);

              m++;

              /* remove v from remaining polygon */
              for (s = v, t = v + 1; t < nv; s++, t++) {
                verts[s] = verts[t];
              }

              nv--;

              /* resest error detection counter */
              count = 2 * nv;
            }
          }

          return result;
        }

        // calculate area of the contour polygon
        var area = function(contour) {
          var n = contour.length,
              a = 0.0;

          for (var p = n - 1, q = 0; q < n; p = q++) {
            a += contour[p].x * contour[q].y - contour[q].x * contour[p].y;
          }

          return a * 0.5;
        }

        // see if p is inside triangle abc
        var insideTriangle = function(ax, ay, bx, by, cx, cy, px, py) {
          var aX, aY, bX, bY,
              cX, cY, apx, apy,
              bpx, bpy, cpx, cpy,
              cCROSSap, bCROSScp, aCROSSbp;

          aX = cx - bx;
          aY = cy - by;
          bX = ax - cx;
          bY = ay - cy;
          cX = bx - ax;
          cY = by - ay;
          apx = px - ax;
          apy = py - ay;
          bpx = px - bx;
          bpy = py - by;
          cpx = px - cx;
          cpy = py - cy;

          aCROSSbp = aX * bpy - aY * bpx;
          cCROSSap = cX * apy - cY * apx;
          bCROSScp = bX * cpy - bY * cpx;

          return ((aCROSSbp >= 0.0) && (bCROSScp >= 0.0) && (cCROSSap >= 0.0));
        }

        var snip = function(contour, u, v, w, n, verts) {
          var p,
              ax, ay, bx, by,
              cx, cy, px, py;

          ax = contour[verts[u]].x;
          ay = contour[verts[u]].y;

          bx = contour[verts[v]].x;
          by = contour[verts[v]].y;

          cx = contour[verts[w]].x;
          cy = contour[verts[w]].y;

          if (EPSILON > (((bx - ax) * (cy - ay)) - ((by - ay) * (cx - ax)))) {
            return false;
          }

          for (p = 0; p < n; p++) {
            if ((p == u) || (p == v) || (p == w)) {
              continue;
            }

            px = contour[verts[p]].x
            py = contour[verts[p]].y

            if (insideTriangle(ax, ay, bx, by, cx, cy, px, py)) {
              return false;
            }
          }

          return true;
        }

        return {
            clockWise: clockWise,
            convex: convex,
            process: process,
            CLOCKWISE: CLOCKWISE,
            COUNTERCLOCKWISE: COUNTERCLOCKWISE,
            CONVEX: CONVEX,
            CONCAVE: CONCAVE
        };


    })();




    return b2;

}));