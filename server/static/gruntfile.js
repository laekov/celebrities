module.exports = function(grunt) {
    grunt.initConfig({
		concat: {
			dev: {
				files: {
					//'dists/router.js': [ 'router/*' ],
					'dists/controller.js': [ 'modules/*/*.js' ],
				}
			}
		},
    });
	require('load-grunt-tasks')(grunt);
	grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.registerTask('default', [ 'concat' ]);
};
