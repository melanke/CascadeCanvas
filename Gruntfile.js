module.exports = function(grunt) {
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
        	options: {
		        separator: '\n\n\n\n\n',
		    },
		    dist: {
		        // the files to concatenate
		        src: [
			        'src/intro.js', 

			        'src/core.js',
			        'src/event.js', 
			        'src/typeChecker.js', 
			        'src/objectTools.js',
			        'src/promise.js',
			        'src/mouse.js',
			        'src/keyboard.js', 
			        'src/ajax.js', 
			        'src/resource.js',
			        'src/loop.js',
			        'src/screen.js', 
			        'src/element.js', 
			        'src/elementlist.js', 

			        'src/footer.js'
		        ],
		        // the location of the resulting JS file
		        dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
		    }
		},
	    jasmine : {
	        src : 'dist/<%= pkg.name %>-<%= pkg.version %>.js',
	        options : {
	            specs : 'specs/**/*.js'
	        }
	    }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    
  	grunt.loadNpmTasks('grunt-contrib-jasmine');

    grunt.registerTask('default', ['concat', 'jasmine']);

    grunt.registerTask('travis', ['concat', 'jasmine']);

};