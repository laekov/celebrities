var angularFiles = [ 
	'bower_components/angular/angular.min.js', 
	'bower_components/angular-ui-router/release/angular-ui-router.min.js',
	'bower_components/oclazyload/dist/ocLazyLoad.min.js',
];
module.exports = function(grunt) {
    grunt.initConfig({
		concat: {
			dev: {
				files: {
					'dists/router.js': [ 'router/*' ],
					'dists/controller.js': [ 'modules/*/*.js' ],
					'dists/lib.angular.js': angularFiles
				},
			}
		},
    });
	require('load-grunt-tasks')(grunt);
	grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.registerTask('default', [ 'concat' ]);
};
