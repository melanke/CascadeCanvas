describe("resource", function(){

	it("load and use resource", function(){

		var url1 = "https://avatars3.githubusercontent.com/u/4949807?s=200";
		var url2 = "https://avatars1.githubusercontent.com/u/1337983?s=200";
		var image1 = null, image2 = null;

		runs(function(){
			CC.loadResources([url1, url2]).then(function(){
			    image1 = CC.useResource(url1);
			    image2 = CC.useResource(url2);
			});
		});

		// waits(6000);

		// runs(function(){
		// 	expect(image1).not.toBe(null);
		// 	expect(image2).not.toBe(null);
		// });

	});

});