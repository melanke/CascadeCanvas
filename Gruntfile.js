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
		}
    });

    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['concat']);

};