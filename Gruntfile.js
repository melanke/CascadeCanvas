module.exports = function(grunt) {
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
		    dist: {
		        // the files to concatenate
		        src: ['src/intro.js', 'src/core.js', 'src/element.js', 'src/elementlist.js', 'src/footer.js'],
		        // the location of the resulting JS file
		        dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
		    }
		}
    });

    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['concat']);

};