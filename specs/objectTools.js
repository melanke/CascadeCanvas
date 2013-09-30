describe("objectTools.js", function(){

	describe("merge", function(){

		it("returns the first param even if have nothing to merge with", function(){

			var a = null;
			var result = CC.merge(a);
			var expected = null;

			expect(result).toBe(expected);

		});

		it("returns null if the first param is null", function(){

			var a = null;
			var b = {
				iwant: "be merged"
			};
			var result = CC.merge(a, b);
			var expected = null;

			expect(result).toBe(expected);

		});

		it("returns the first param, and both will be merged to other params", function(){

			var a = {};
			var b = {
				iwant: "be merged"
			};
			var result = CC.merge(a, b);
			var expected = {
				iwant: "be merged"
			};

			expect(result).toEqual(expected);
			expect(a).toEqual(result);

		});

		it("keep the attributes of all params", function(){

			var a = {
				iam: "the first"
			};
			var b = {
				iwant: "be merged"
			};
			var result = CC.merge(a, b);
			var expected = {
				iam: "the first",
				iwant: "be merged"
			};

			expect(result).toEqual(expected);
			expect(a).toEqual(result);

		});

		it("replace attributes with the same name by the last param", function(){

			var a = {
				iam: "the first",
				ok: "i am replaceble"
			};
			var b = {
				iwant: "be merged",
				ok: "i will replace you"
			};
			var result = CC.merge(a, b);
			var expected = {
				iam: "the first",
				iwant: "be merged",
				ok: "i will replace you"
			};

			expect(result).toEqual(expected);
			expect(a).toEqual(result);

		});

		it("replace attributes with the same name by the last param", function(){

			var a = {
				iam: "the first",
				ok: "i am replaceble"
			};
			var b = {
				iwant: "be merged",
				ok: {}
			};
			var result = CC.merge(a, b);
			var expected = {
				iam: "the first",
				iwant: "be merged",
				ok: {}
			};

			expect(result).toEqual(expected);
			expect(a).toEqual(result);

		});

		it("merge deeply", function(){

			var a = {
				deep: {
					a: "a1",
					b: "b1",
					deeper: {
						z: "z1",
						y: "y1"
					}
				}
			};
			var b = {
				deep: {
					b: "b2",
					c: "c2",
					deeper: {
						y: "y2",
						x: "x2"
					}
				}
			};
			var result = CC.merge(a, b);
			var expected = {
				deep: {
					a: "a1",
					b: "b2",
					c: "c2",
					deeper: {
						z: "z1",
						y: "y2",
						x: "x2"
					}
				}
			};

			expect(result).toEqual(expected);
			expect(a).toEqual(result);

		});

		it("replace attributes with the same name by the last param and accepts as many params you want", function(){

			var a = {
				iam: "the first",
				ok: "i am replaceble"
			};
			var b = {
				iwant: "be merged",
				ok: "i will replace you"
			};
			var c = {
				iwill: "be included too",
				ok: "i will replace you both :)"
			};
			var result = CC.merge(a, b, c);
			var expected = {
				iam: "the first",
				iwant: "be merged",
				iwill: "be included too",
				ok: "i will replace you both :)"
			};

			expect(result).toEqual(expected);
			expect(a).toEqual(result);

		});

	});

	describe("sort", function(){

		it("sort array with number", function(){

			var entry = [{
				a: 5,
				b: 8
			},{
				a: 3,
				b: 9
			},{
				a: 7,
				b: 3
			},{
				a: 9,
				b: 2
			},{
				a: 6,
				b: 9
			},{
				a: 3,
				b: 1
			}];

			var result = CC.sort(entry, "a");
			var expected = [{
				a: 3,
				b: 9
			},{
				a: 3,
				b: 1
			},{
				a: 5,
				b: 8
			},{
				a: 6,
				b: 9
			},{
				a: 7,
				b: 3
			},{
				a: 9,
				b: 2
			}];

			expect(result).toEqual(expected);

		});

		it("sort array with number descending", function(){

			var entry = [{
				a: 5,
				b: 8
			},{
				a: 3,
				b: 9
			},{
				a: 7,
				b: 3
			},{
				a: 9,
				b: 2
			},{
				a: 6,
				b: 9
			},{
				a: 3,
				b: 1
			}];

			var result = CC.sort(entry, "a", true);
			var expected = [{
				a: 9,
				b: 2
			},{
				a: 7,
				b: 3
			},{
				a: 6,
				b: 9
			},{
				a: 5,
				b: 8
			},{
				a: 3,
				b: 9
			},{
				a: 3,
				b: 1
			}];

			expect(result).toEqual(expected);

		});

		it("sort array with string", function(){

			var entry = [{
				a: "bacalhau",
				b: 8
			},{
				a: "abacaxi",
				b: 9
			},{
				a: "carambola",
				b: 3
			},{
				a: "zebra",
				b: 2
			},{
				a: "damasco",
				b: 9
			},{
				a: "carambola",
				b: 1
			}];

			var result = CC.sort(entry, "a");
			var expected = [{
				a: "abacaxi",
				b: 9
			},{
				a: "bacalhau",
				b: 8
			},{
				a: "carambola",
				b: 3
			},{
				a: "carambola",
				b: 1
			},{
				a: "damasco",
				b: 9
			},{
				a: "zebra",
				b: 2
			}];

			expect(result).toEqual(expected);

		});

		it("sort array with date", function(){

			var entry = [{
				a: new Date(2013, 9, 29),
				b: 8
			},{
				a: new Date(2008, 11, 30),
				b: 9
			},{
				a: new Date(2010, 5, 12),
				b: 3
			},{
				a: new Date(2009, 9, 11),
				b: 2
			},{
				a: new Date(2014, 1, 1),
				b: 9
			},{
				a: new Date(2010, 5, 11),
				b: 1
			}];

			var result = CC.sort(entry, "a");
			var expected = [{
				a: new Date(2008, 11, 30),
				b: 9
			},{
				a: new Date(2009, 9, 11),
				b: 2
			},{
				a: new Date(2010, 5, 11),
				b: 1
			},{
				a: new Date(2010, 5, 12),
				b: 3
			},{
				a: new Date(2013, 9, 29),
				b: 8
			},{
				a: new Date(2014, 1, 1),
				b: 9
			}];

			expect(result).toEqual(expected);

		});

		it("sort object with number", function(){

			var entry = {
				these: {
					a: 5,
					b: 8
				},

				names: {
					a: 3,
					b: 9
				},

				doesnt: {
					a: 7,
					b: 3
				},

				matter: {
					a: 9,
					b: 2
				},

				bla: {
					a: 6,
					b: 9
				},

				ble: {
					a: 3,
					b: 1
				}
			};

			var result = CC.sort(entry, "a");
			var expected = [{
				a: 3,
				b: 9
			},{
				a: 3,
				b: 1
			},{
				a: 5,
				b: 8
			},{
				a: 6,
				b: 9
			},{
				a: 7,
				b: 3
			},{
				a: 9,
				b: 2
			}];

			expect(result).toEqual(expected);

		});

	});

	describe("rotatePoint", function(){

		it("rotate 45 degrees", function(){

			var point = [100, 100];
			var anchor = [0, 100];
			var angle = 45;
			var result = CC.rotatePoint(point, anchor, angle);
			var expected = {
				x: 71,
				y: 29
			};

			expect(result).toEqual(expected);

		});

		it("rotate 90 degrees", function(){

			var point = {x: 100, y: 100};
			var anchor = {x: 0, y: 100};
			var angle = 90;
			var result = CC.rotatePoint(point, anchor, angle);
			var expected = {
				x: 0,
				y: 0
			};

			expect(result).toEqual(expected);

		});

		it("rotate -30 degrees", function(){

			var point = [100, 100];
			var anchor = {x: 0, y: 100};
			var angle = -30;
			var result = CC.rotatePoint(point, anchor, angle);
			var expected = {
				x: 87,
				y: 150
			};

			expect(result).toEqual(expected);

		});

	});

});