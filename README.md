# CascadeCanvas 1.1.0 Beta [![Build Status](https://travis-ci.org/CascadeCanvas/CascadeCanvas.png)](https://travis-ci.org/CascadeCanvas/CascadeCanvas) [![Stories in Ready](https://badge.waffle.io/CascadeCanvas/CascadeCanvas.png?label=ready)](http://waffle.io/CascadeCanvas/CascadeCanvas) [![Bountysource](https://www.bountysource.com/badge/tracker?tracker_id=2390002)](https://www.bountysource.com/trackers/2390002-cascadecanvas?utm_source=2390002&utm_medium=shield&utm_campaign=TRACKER_BADGE)

CascadeCanvas is not just a good way to declare how to draw in HTML5 Canvas. CC takes OOP to a next level with multi-inheritance, allow you to use the flexibility of Javascript and the design patterns you already learn with JS.

The Games and Rich Internet Applications API made for who already Loves Javascript.

###[Download](https://rawgithub.com/CascadeCanvas/CascadeCanvas/master/cc.min.js)

[![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=H84XN5VYTBVYQ&lc=US&item_name=Cascade%20Canvas&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donate_LG%2egif%3aNonHosted)

## Comparing CSS and jQuery with CascadeCanvas

```
/*** CSS ***/                            |  /*** CASCADECANVAS ***/
                                         |
.parentClass, .subClass1, .subClass2{    |  CC.def(“parentClass”, function(){ 
    width: 50px;                         |      this.w = 50;
    height: 50px;                        |      this.h = 50;
    background: #ff0000;                 |      //creating a layer called “base”
    position: absolute;                  |      this.layers.base = {
    border: 1px solid;                   |          shape: “rect”,
}										 |          fill: { color: “#ff0000” }
										 |      };
										 |  });
										 |
.subClass1{								 |  CC.def(“subClass1”, function(){
    border-color: #00ff00;				 |      this.inherit(“parentClass");
}										 |		//merge attributes defined
										 |		//before with this new ones
										 |		this.merge({
										 |		    layers: {
										 |			    base: {
										 |				    stroke: { color: “#00ff00” }
										 |				}
										 |			}
										 |		});
										 |	});
										 |
.subClass2{								 |	CC.def(“subClass2”, function(){
    left: 100px;						 |		this.x = 100;
    top: 5px; 							 |		this.y = 5;
    border-color: #0000ff;				 |		this.inherit(“parentClass");
}										 |		this.merge({
										 |			layers: {
										 |				base: {
										 |					stroke: { color: “#0000ff” }
										 |				}
										 |			}
										 |		});
										 |	});
/*** HTML ***/                           |  
                                         |
<div class=”subClass1></div>			   |  CC.new(“subClass1”);
<div class=”subClass2” 					 |	CC.new(“subClass2”).x = 160;
    style="left: 160px"></div>           |
<div class=”subClass1 subClass2”>        |	CC.new(“subClass1 subClass2”);
</div>									 |
<div class=”subClass1” 					 |	CC.new(“subClass1”, {
    style=”left: 30px; top: 10px”>       |      x: 30,
</div>									 |		y: 10
										 |	});
/*** JQUERY ***/                         |
                                         |
$(“.subClass1”).eq(0).css({				 |	CC(“subClass1”).e(0).merge({
    left: 200,							 |		x: 200,
    top: 50 							 |		y: 50
});										 |	});
										 |
										 |  CC.startLoop();
```

[Try in JSFiddle](http://jsfiddle.net/585rX/)

### Learn

Read the [wiki](https://github.com/CascadeCanvas/CascadeCanvas/wiki) and the [first steps guide](https://github.com/CascadeCanvas/CascadeCanvas/wiki/First-Steps) and see how much CascadeCanvas has to offer.

### Questions

Search for your question at the [repository issues](https://github.com/CascadeCanvas/CascadeCanvas/issues) or Stackoverflow, if you can't find it, create a new issue with the tag "question" and we will try to answe as soon as possible. We will try to answer at Stackoverflow too.

### Plugins List

Lets enrich the Javascript Games community, Do you believe some class of yours may help anybody else? Create a issue with the tag "plugin" and we will add it to our list.

### Do you want to contribute to make CascadeCanvas better?

Every single help is welcome, but they need to be organized:

* Found a bug? Open a issue with the tag "bug", when it gets approved, you can volunteer yourself to fix it :D
But it is okay if you don't know how to fix, it is a big help just by reporting it.
* Do you have a suggestion to make? Open a issue with the tag "suggestion", when it gets approved, you can volunteer yourself to fix it :D
* If you want to code something try to use the coding pattern of the project, write unit tests and send a PullRequest.

