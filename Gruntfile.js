
module.exports = function(grunt) {

  // Load grunt tasks automatically as needed ("jit")
  require('jit-grunt')(grunt, {
    mochaTest: 'grunt-mocha-test'
  });


  // Define the configuration for all the tasks
  grunt.initConfig({
    // using mocha for the tests
    mochaTest: {
      src: ['./test/*.spec.js']
    }
  });


  grunt.registerTask("test", ['mochaTest']);
};
