module.exports = function(grunt) {
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        orderedsrc : [ 
	        'src/core.js',
	        'src/event.js', 
	        'src/typeChecker.js', 
	        'src/objectTools.js',
	        'src/math.js',
	        'src/promise.js',
	        'src/mouse.js',
	        'src/keyboard.js', 
	        'src/ajax.js', 
	        'src/resource.js',
	        'src/color.js',
	        'src/drawer.js',
	        'src/loop.js',
	        'src/element.js', 
	        'src/elementlist.js', 
	        'src/animation.js'
        ],
        concat: {
        	options: {
		        separator: '\n\n\n\n\n',
		    },
		    dist: {
		        src: ['src/intro.js', '<%= orderedsrc %>', 'src/footer.js'],
		        dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
		    }
		},
		copy: {
			main: {
				src: 'dist/<%= pkg.name %>-<%= pkg.version %>.js',
				dest: 'cc.js'
			}
		},
		uglify: {
		    options: {
		        mangle: false
		    },
		    all: {
		        files: {
		            'cc.min.js': ['dist/<%= pkg.name %>-<%= pkg.version %>.js']
		        }
		    }
		 },
	    jasmine : {
	        src : '<%= orderedsrc %>',
	        options : {
	            specs : 'specs/**/*.js',
	            template: require('grunt-template-jasmine-istanbul'),
				templateOptions: {
					coverage: 'codecoverage/coverage.json',
					report: [
						{
							type: 'html',
							options: {
								dir: 'codecoverage'
							}
						},
						{
							type: 'text-summary'
						}
					]
				}
	        }
	    }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.loadNpmTasks('grunt-contrib-uglify');
    
  	grunt.loadNpmTasks('grunt-contrib-jasmine');

    grunt.registerTask('default', ['concat', 'copy', 'uglify', 'jasmine']);

    grunt.registerTask('travis',  ['concat', 'jasmine']);

};