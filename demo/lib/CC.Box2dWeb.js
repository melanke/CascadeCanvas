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

        CC.bind("enterframe", function(){
            el.x = (el.body.GetPosition().x * b2.scale) - (el.w/2); //position of Box2D is at center
            el.y = (el.body.GetPosition().y * b2.scale) - (el.h/2);
            el.angle = el.body.GetAngle() / Math.PI * 180.0;
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

        init();

    });

    CC.def("b2CircleShape", function(opts){

        var el = this;

        var init = function(){

            el.inherit("b2Body", opts);

            var radius = el.w / 2;

            el.fixDef.shape = new b2.CircleShape(radius / b2.scale);
            
            el.body = world.CreateBody(el.bodyDef);
            el.fixture = el.body.CreateFixture(el.fixDef);
        };

        init();

    });

    return b2;

}));